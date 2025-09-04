'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { setupCornerstone, getCornerstone } from '@/lib/cornerstone/setup';

type WheelMode = 'slice' | 'stack' | 'zoom' | 'mixed';

interface Props {
    imageIds: string[];
    index?: number;
    onIndexChange?: (next: number) => void;

    zoom?: number;
    invert?: boolean;           // 사용자 토글 (UI)
    windowCenter?: number;
    windowWidth?: number;
    rotation?: number;

    fitToWindow?: boolean;
    enablePrefetch?: boolean;
    wheelBehavior?: WheelMode;
    zoomStep?: number;
    minZoom?: number;
    maxZoom?: number;
    className?: string;
    onError?: (e: unknown) => void;

    interpolate?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export const CornerstoneViewport: React.FC<Props> = ({
                                                         imageIds,
                                                         index = 0,
                                                         onIndexChange,

                                                         zoom = 1,
                                                         invert = false,             // 기본 false(사용자 토글)
                                                         windowCenter,
                                                         windowWidth,
                                                         rotation = 0,

                                                         interpolate = true,
                                                         fitToWindow = true,
                                                         enablePrefetch = true,
                                                         wheelBehavior = 'mixed',
                                                         zoomStep = 0.2,
                                                         minZoom = 0.1,
                                                         maxZoom = 5,
                                                         className,
                                                         onError,
                                                     }) => {
    const elRef = useRef<HTMLDivElement | null>(null);
    const key = useMemo(() => imageIds.join('|'), [imageIds]);

    const readyRef = useRef(false);
    const readyKeyRef = useRef<string>('');
    const userZoomingRef = useRef(false);
    const zoomResetTimerRef = useRef<any>(null);

    // ▷ DICOM이 요구하는 기본 invert (예: MONOCHROME1 → true)
    const baseInvertRef = useRef<boolean>(false);

    const isElementEnabled = (cs: any, el: HTMLElement) => {
        try { cs.getEnabledElement(el); return true; } catch { return false; }
    };
    const safeGetViewport = (cs: any, el: HTMLElement) => {
        try { return cs.getViewport(el); } catch { return null; }
    };

    const safeVOI = (ww?: number, wc?: number) => {
        const isNum = (v: any) => typeof v === 'number' && isFinite(v);
        const WW_MIN = 1, WW_MAX = 65535, WC_MIN = -32768, WC_MAX = 32767;
        const wwSafe = isNum(ww) ? clamp(Math.round(ww as number), WW_MIN, WW_MAX) : undefined;
        const wcSafe = isNum(wc) ? clamp(Math.round(wc as number), WC_MIN, WC_MAX) : undefined;
        return { ww: wwSafe, wc: wcSafe };
    };

    // ▷ 사용자 토글(invert)과 DICOM 기본(baseInvert) XOR로 실제 적용값 계산
    const getEffectiveInvert = () =>
        Boolean(invert) !== Boolean(baseInvertRef.current);

    /** translation=0, scale만 계산해서 적용 (VOI/Invert는 건드리지 않음) */
    const applyDeterministicFit = (cs: any, el: HTMLElement, rotationDeg: number) => {
        if (!isElementEnabled(cs, el)) return;
        const enabled = cs.getEnabledElement(el);
        if (!enabled?.image) return;

        const vp = safeGetViewport(cs, el);
        if (!vp) return;

        const rect = el.getBoundingClientRect();
        const W = Math.max(1, Math.floor(rect.width));
        const H = Math.max(1, Math.floor(rect.height));

        const rot = ((Math.round((rotationDeg ?? 0) / 90) * 90) % 360 + 360) % 360;
        const rot90 = rot === 90 || rot === 270;

        const par = (vp as any).pixelAspectRatio ?? 1;
        const parForFit = rot90 ? 1 / (par > 0 ? par : 1) : (par > 0 ? par : 1);

        // 세로 유효 행수 = rows / par (par = col/row)
        const effRows = enabled.image.rows / parForFit;

        const sX = W / enabled.image.columns;
        const sY = H / effRows;
        const sFit = Math.max(0.01, Math.min(sX, sY));

        (vp as any).translation = { x: 0, y: 0 };
        vp.scale = sFit;
        cs.setViewport(el, vp);
    };

    /** VOI 안전 적용 */
    const applyVOI = (cs: any, el: HTMLElement, ww?: number, wc?: number) => {
        const vp = safeGetViewport(cs, el);
        if (!vp) return;
        const { ww: _ww, wc: _wc } = safeVOI(ww, wc);
        if (_ww !== undefined && _wc !== undefined) {
            (vp as any).voi = { windowWidth: _ww, windowCenter: _wc };
            cs.setViewport(el, vp);
        }
    };

    // 초기 enable + 첫 display
    useEffect(() => {
        let alive = true;
        let cs: any;
        const el = elRef.current;
        if (!el || imageIds.length === 0) return;

        el.style.width = '100%';
        el.style.height = '100%';

        (async () => {
            try {
                await setupCornerstone();
                cs = await getCornerstone();
                if (!alive) return;

                try { cs.disable(el); } catch {}
                cs.enable(el);

                const safeIdx = Math.min(Math.max(0, index), imageIds.length - 1);
                const imgId = imageIds[safeIdx];
                const image = await cs.loadAndCacheImage(imgId);
                if (!alive) return;

                // ▷ DICOM 기본 invert 기억
                baseInvertRef.current = !!(image as any)?.invert;

                // 기본 VP
                let vp = cs.getDefaultViewportForImage(el, image);

                // 픽셀 비 (이상치 가드)
                const rowPS = (image as any).rowPixelSpacing ?? (image as any).rowPixelSpacingMM;
                const colPS = (image as any).columnPixelSpacing ?? (image as any).columnPixelSpacingMM;
                if (typeof rowPS === 'number' && typeof colPS === 'number' && rowPS > 0 && colPS > 0) {
                    const ratio = colPS / rowPS;
                    if (ratio > 0.2 && ratio < 5) (vp as any).pixelAspectRatio = ratio;
                }

                // ▷ invert는 "사용자토글 XOR DICOM기본"을 실제로 적용
                vp.invert = getEffectiveInvert();

                (vp as any).rotation = (((Math.round((rotation ?? 0) / 90) * 90) % 360) + 360) % 360;
                (vp as any).pixelReplication = !interpolate;

                // 표시
                cs.displayImage(el, image, vp);

                // 결정론적 fit
                if (fitToWindow) {
                    applyDeterministicFit(cs, el, rotation ?? 0);
                    requestAnimationFrame(() => applyDeterministicFit(cs, el, rotation ?? 0));
                }

                // 초기 VOI 적용
                applyVOI(cs, el, windowWidth, windowCenter);

                readyKeyRef.current = key;
                readyRef.current = true;

                try { cs.resize?.(el, true); } catch {}

                const ro = new ResizeObserver(() => {
                    try {
                        cs.resize?.(el, true);
                        if (fitToWindow && !userZoomingRef.current && (zoom ?? 1) === 1) {
                            applyDeterministicFit(cs, el, rotation ?? 0);
                        }
                    } catch {}
                });
                ro.observe(el);
                (el as any).__ro = ro;
            } catch (e) {
                onError?.(e);
                console.error('[CornerstoneViewport] init/display error:', e);
            }
        })();

        return () => {
            alive = false;
            try { (elRef.current as any)?.__ro?.disconnect?.(); } catch {}
            try { cs?.disable?.(elRef.current!); } catch {}
            readyRef.current = false;
            readyKeyRef.current = '';
            userZoomingRef.current = false;
            if (zoomResetTimerRef.current) {
                clearTimeout(zoomResetTimerRef.current);
                zoomResetTimerRef.current = null;
            }
        };
    }, [
        key,
        fitToWindow,
        rotation,
        interpolate,
        // 초기 VOI 반영 필요
        windowCenter,
        windowWidth,
    ]);

    // 인덱스(슬라이스) 변경
    useEffect(() => {
        const el = elRef.current;
        if (!el || imageIds.length === 0) return;
        if (!readyRef.current || readyKeyRef.current !== key) return;

        (async () => {
            try {
                const cs = await getCornerstone();
                if (!isElementEnabled(cs, el)) return;

                const safeIdx = Math.min(Math.max(0, index), imageIds.length - 1);
                const imgId = imageIds[safeIdx];
                const image = await cs.loadAndCacheImage(imgId);

                // ▷ 슬라이스별 DICOM 기본 invert 갱신
                baseInvertRef.current = !!(image as any)?.invert;

                const currVp = safeGetViewport(cs, el);
                let nextVp = currVp ?? cs.getDefaultViewportForImage(el, image);

                // 픽셀 비 갱신
                const rowPS = (image as any).rowPixelSpacing ?? (image as any).rowPixelSpacingMM;
                const colPS = (image as any).columnPixelSpacing ?? (image as any).columnPixelSpacingMM;
                if (typeof rowPS === 'number' && typeof colPS === 'number' && rowPS > 0 && colPS > 0) {
                    const ratio = colPS / rowPS;
                    if (ratio > 0.2 && ratio < 5) (nextVp as any).pixelAspectRatio = ratio;
                    else if ((nextVp as any).pixelAspectRatio) delete (nextVp as any).pixelAspectRatio;
                }

                // ▷ 실제 invert 적용
                nextVp.invert = getEffectiveInvert();
                (nextVp as any).pixelReplication = !interpolate;

                cs.displayImage(el, image, nextVp);

                if (fitToWindow && (zoom ?? 1) === 1) {
                    applyDeterministicFit(cs, el, rotation ?? 0);
                    requestAnimationFrame(() => applyDeterministicFit(cs, el, rotation ?? 0));
                }
                if (zoom !== 1) {
                    const vp2 = cs.getViewport(el);
                    if (vp2) { vp2.scale = clamp(zoom!, minZoom, maxZoom); cs.setViewport(el, vp2); }
                }

                // VOI 재적용
                applyVOI(cs, el, windowWidth, windowCenter);
            } catch (e) {
                onError?.(e);
                console.error('[CornerstoneViewport] change index error:', e);
            }
        })();
    }, [index, key, interpolate, fitToWindow, zoom, minZoom, maxZoom, rotation, windowCenter, windowWidth, onError, imageIds.length]);

    // 뷰포트 속성 변경(zoom/invert/VOI/rotation/보간)
    useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        if (!readyRef.current || readyKeyRef.current !== key) return;

        (async () => {
            try {
                const cs = await getCornerstone();
                if (!isElementEnabled(cs, el)) return;
                const enabled = cs.getEnabledElement(el);
                if (!enabled.image) return;

                const vp = safeGetViewport(cs, el);
                if (!vp) return;

                // ▷ invert는 항상 '사용자 XOR DICOM기본'
                vp.invert = getEffectiveInvert();

                (vp as any).rotation = (((Math.round((rotation ?? 0) / 90) * 90) % 360) + 360) % 360;
                (vp as any).pixelReplication = !interpolate;

                cs.setViewport(el, vp);

                // zoom 정책
                if (fitToWindow && (zoom ?? 1) === 1 && !userZoomingRef.current) {
                    applyDeterministicFit(cs, el, rotation ?? 0);
                } else if (zoom !== 1) {
                    const vp2 = cs.getViewport(el);
                    if (vp2) { vp2.scale = clamp(zoom!, minZoom, maxZoom); cs.setViewport(el, vp2); }
                }

                // VOI는 마지막에 확실히
                applyVOI(cs, el, windowWidth, windowCenter);
            } catch {}
        })();
    }, [zoom, invert, windowCenter, windowWidth, rotation, interpolate, minZoom, maxZoom, fitToWindow, key]);

    // 휠: slice/stack/zoom/mixed
    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const onWheel = async (ev: WheelEvent) => {
            ev.preventDefault();
            try {
                const cs = await getCornerstone();
                const vp = cs.getViewport(el);
                if (!vp) return;

                const isStackMode = wheelBehavior === 'stack' || wheelBehavior === 'slice';
                const ctrlZoom = wheelBehavior === 'mixed' && (ev.ctrlKey || ev.metaKey);
                const doZoom = wheelBehavior === 'zoom' || ctrlZoom;
                const goingDown = ev.deltaY > 0;

                if (doZoom) {
                    userZoomingRef.current = true;
                    const next = clamp(
                        vp.scale * (goingDown ? 1 - (zoomStep ?? 0.2) : 1 + (zoomStep ?? 0.2)),
                        minZoom ?? 0.1,
                        maxZoom ?? 5
                    );
                    vp.scale = next;
                    cs.setViewport(el, vp);
                    if (zoomResetTimerRef.current) clearTimeout(zoomResetTimerRef.current);
                    zoomResetTimerRef.current = setTimeout(() => { userZoomingRef.current = false; }, 600);
                    return;
                }

                if (isStackMode && imageIds.length > 1 && onIndexChange) {
                    const step = goingDown ? 1 : -1;
                    const nextIdx = clamp((index ?? 0) + step, 0, imageIds.length - 1);
                    if (nextIdx !== index) onIndexChange(nextIdx);
                }
            } catch (e) {
                onError?.(e);
            }
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [wheelBehavior, zoomStep, minZoom, maxZoom, index, imageIds.length, onIndexChange, onError]);

    // 인접 슬라이스 프리페치
    useEffect(() => {
        if (!enablePrefetch || imageIds.length <= 1) return;
        (async () => {
            try {
                const cs = await getCornerstone();
                const targets = new Set<string>();
                const push = (i: number) => { if (i >= 0 && i < imageIds.length) targets.add(imageIds[i]); };
                push(index + 1); push(index + 2); push(index - 1); push(index - 2);
                await Promise.all(Array.from(targets).map((id) => cs.loadAndCacheImage(id).catch(() => {})));
            } catch {}
        })();
    }, [enablePrefetch, index, key, imageIds.length]);

    return <div ref={elRef} className={className ?? 'absolute inset-0'} />;
};
