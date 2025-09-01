'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { setupCornerstone, getCornerstone } from '@/lib/cornerstone/setup'

// 'slice'를 'stack'과 동치로 취급합니다.
type WheelMode = 'slice' | 'stack' | 'zoom' | 'mixed'

interface Props {
    imageIds: string[]
    /** 표시할 현재 인덱스 (기본 0) */
    index?: number
    /** 인덱스 변경 콜백 (휠/키보드로 슬라이스 이동 시 호출) */
    onIndexChange?: (next: number) => void

    /** 뷰포트 상태 */
    zoom?: number // 절대 스케일 (1.0 = 100%)
    invert?: boolean // 흑/백 반전
    windowCenter?: number // VOI center
    windowWidth?: number // VOI width
    rotation?: number // 회전 (deg, 0/90/180/270 권장)

    /** 옵션 */
    fitToWindow?: boolean // 최초 표시/리사이즈 시 fit
    enablePrefetch?: boolean // 주변 슬라이스 프리페치
    wheelBehavior?: WheelMode // 'slice' | 'stack' | 'zoom' | 'mixed'
    zoomStep?: number // 1회 휠 줌 스텝 (기본 0.2)
    minZoom?: number // 최소 스케일 (기본 0.1)
    maxZoom?: number // 최대 스케일 (기본 5)
    className?: string
    onError?: (e: unknown) => void

    /** 품질 옵션 */
    interpolate?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
const normRot = (deg?: number) => {
    if (typeof deg !== 'number' || !isFinite(deg)) return 0
    const r = ((Math.round(deg / 90) * 90) % 360 + 360) % 360
    return r
}

export const CornerstoneViewport: React.FC<Props> = ({
                                                         imageIds,
                                                         index = 0,
                                                         onIndexChange,

                                                         zoom = 1,
                                                         invert = false,
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
    const elRef = useRef<HTMLDivElement | null>(null)
    const key = useMemo(() => imageIds.join('|'), [imageIds])


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

                let vp = cs.getDefaultViewportForImage(el, image);

                // ▷ 픽셀 비율(Aspect) 보정
                const rowPS = (image as any).rowPixelSpacing ?? (image as any).rowPixelSpacingMM;
                const colPS = (image as any).columnPixelSpacing ?? (image as any).columnPixelSpacingMM;
                if (typeof rowPS === 'number' && typeof colPS === 'number' && rowPS > 0 && colPS > 0) {
                    // column / row 비율: 세로 픽셀 대비 가로 픽셀의 물리적 비
                    (vp as any).pixelAspectRatio = colPS / rowPS;
                }

                // ▷ 초기 상태 반영
                vp.invert = !!invert;
                if (typeof windowCenter === 'number' && typeof windowWidth === 'number') {
                    vp.voi = { windowCenter, windowWidth };
                }
                vp.scale = Math.min(Math.max(zoom, minZoom), maxZoom);
                (vp as any).rotation = (((Math.round(rotation / 90) * 90) % 360) + 360) % 360;

                // ▷ 보간(화질) 설정: true → 선형보간, false → 최근접
                (vp as any).pixelReplication = !interpolate;

                cs.displayImage(el, image, vp);

                if (fitToWindow && cs.fitToWindow) cs.fitToWindow(el);
                cs.resize?.(el, true);

                const ro = new ResizeObserver(() => {
                    try {
                        cs.resize?.(el, true);
                        if (fitToWindow && cs.fitToWindow) cs.fitToWindow(el);
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
        };
    }, [key]);

    // 이미지 교체 시 기존 뷰포트 유지 + 픽셀 비율/보간 재적용
    useEffect(() => {
        const el = elRef.current;
        if (!el || imageIds.length === 0) return;
        (async () => {
            try {
                const cs = await getCornerstone();
                const safeIdx = Math.min(Math.max(0, index), imageIds.length - 1);
                const imgId = imageIds[safeIdx];
                const image = await cs.loadAndCacheImage(imgId);

                const vp = cs.getViewport(el) ?? cs.getDefaultViewportForImage(el, image);

                // ▷ 픽셀 비율 보정 업데이트
                const rowPS = (image as any).rowPixelSpacing ?? (image as any).rowPixelSpacingMM;
                const colPS = (image as any).columnPixelSpacing ?? (image as any).columnPixelSpacingMM;
                if (typeof rowPS === 'number' && typeof colPS === 'number' && rowPS > 0 && colPS > 0) {
                    (vp as any).pixelAspectRatio = colPS / rowPS;
                } else {
                    // 메타 없으면 기본값 제거
                    if ((vp as any).pixelAspectRatio) delete (vp as any).pixelAspectRatio;
                }

                // ▷ 보간 설정 유지
                (vp as any).pixelReplication = !interpolate;

                cs.displayImage(el, image, vp);
            } catch (e) {
                onError?.(e);
                console.error('[CornerstoneViewport] change index error:', e);
            }
        })();
    }, [index, key, interpolate]);

    // zoom/invert/VOI/rotation/보간 변경 시 뷰포트 갱신
    useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        (async () => {
            try {
                const cs = await getCornerstone();
                const vp = cs.getViewport(el);
                if (!vp) return;

                vp.scale = Math.min(Math.max(zoom, minZoom), maxZoom);
                vp.invert = !!invert;
                if (typeof windowCenter === 'number' && typeof windowWidth === 'number') {
                    vp.voi = { windowCenter, windowWidth };
                }
                (vp as any).rotation = (((Math.round(rotation / 90) * 90) % 360) + 360) % 360;
                (vp as any).pixelReplication = !interpolate;

                cs.setViewport(el, vp);
            } catch {}
        })();
    }, [zoom, invert, windowCenter, windowWidth, rotation, interpolate, minZoom, maxZoom]);

    // 휠: slice/stack/zoom/mixed
    useEffect(() => {
        const el = elRef.current
        if (!el) return

        const onWheel = async (ev: WheelEvent) => {
            ev.preventDefault()
            try {
                const cs = await getCornerstone()
                const vp = cs.getViewport(el)
                if (!vp) return

                const isStackMode = wheelBehavior === 'stack' || wheelBehavior === 'slice'
                const ctrlZoom = wheelBehavior === 'mixed' && (ev.ctrlKey || ev.metaKey)
                const doZoom = wheelBehavior === 'zoom' || ctrlZoom
                const goingDown = ev.deltaY > 0

                if (doZoom) {
                    const next = clamp(vp.scale * (goingDown ? 1 - (zoomStep ?? 0.2) : 1 + (zoomStep ?? 0.2)), minZoom ?? 0.1, maxZoom ?? 5)
                    vp.scale = next
                    cs.setViewport(el, vp)
                    return
                }

                if (isStackMode && imageIds.length > 1 && onIndexChange) {
                    const step = goingDown ? 1 : -1
                    const nextIdx = clamp((index ?? 0) + step, 0, imageIds.length - 1)
                    if (nextIdx !== index) onIndexChange(nextIdx)
                }
            } catch (e) {
                onError?.(e)
            }
        }

        el.addEventListener('wheel', onWheel, { passive: false })
        return () => el.removeEventListener('wheel', onWheel)
    }, [wheelBehavior, zoomStep, minZoom, maxZoom, index, imageIds.length, onIndexChange])

    // 인접 슬라이스 프리페치
    useEffect(() => {
        if (!enablePrefetch || imageIds.length <= 1) return
            ;(async () => {
            try {
                const cs = await getCornerstone()
                const targets = new Set<string>()
                const push = (i: number) => {
                    if (i >= 0 && i < imageIds.length) targets.add(imageIds[i])
                }
                push(index + 1)
                push(index + 2)
                push(index - 1)
                push(index - 2)

                await Promise.all(Array.from(targets).map((id) => cs.loadAndCacheImage(id).catch(() => {})))
            } catch {}
        })()
    }, [enablePrefetch, index, key])

    return <div ref={elRef} className={className ?? 'w-full h-full bg-black'} />
}
