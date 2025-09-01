"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerstoneViewport } from "@/components/viewer/CornerstoneViewport";
import { setupCornerstone } from "@/lib/cornerstone/setup";
import { RotateCcw, RotateCw } from "lucide-react";

// 윈도우/레벨 프리셋
const WL_PRESETS: Record<string, { wc: number; ww: number }> = {
    "Soft Tissue": { wc: 40, ww: 400 },
    Lung: { wc: -600, ww: 1500 },
    Bone: { wc: 300, ww: 1500 },
    Brain: { wc: 40, ww: 80 },
};

type WheelMode = "slice" | "zoom" | "mixed"; // CornerstoneViewport는 'slice'를 'stack'과 동치로 처리

export default function LocalViewerPage() {
    const [imageIds, setImageIds] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    // CornerstoneViewport에 전달할 상태
    const [zoom, setZoom] = useState(1);
    const [invert, setInvert] = useState(false);
    const [windowCenter, setWindowCenter] = useState(40);
    const [windowWidth, setWindowWidth] = useState(400);
    const [wheelBehavior, setWheelBehavior] = useState<WheelMode>("mixed");
    const [rotation, setRotation] = useState(0); // deg (0/90/180/270 권장)
    const [interpolate, setInterpolate] = useState(true);
    // Cine 재생
    const [isPlaying, setIsPlaying] = useState(false);
    const fpsRef = useRef(12);
    const rafRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // 초기 Cornerstone/WADO 설정
    useEffect(() => {
        setupCornerstone();
    }, []);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const list = Array.from(files);
        if (list.length === 0) return;

        const wadoMod = await import("cornerstone-wado-image-loader");
        const wado: any = (wadoMod as any).default ?? wadoMod;

        // 여러 파일 지원: fileManager에 등록하여 imageId 생성
        const ids = list.map((f) => wado.wadouri.fileManager.add(f));

        setImageIds(ids);
        setIndex(0);
        // 기본 상태 초기화
        setZoom(1);
        setInvert(false);
        setWindowCenter(40);
        setWindowWidth(400);
        setRotation(0);
    }, []);

    // 드래그&드롭
    const onDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.files?.length) {
                await handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles]
    );

    // 키보드 단축키
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (imageIds.length === 0) return;
            switch (e.key) {
                case "ArrowLeft":
                    setIndex((v) => Math.max(0, v - 1));
                    break;
                case "ArrowRight":
                    setIndex((v) => Math.min(imageIds.length - 1, v + 1));
                    break;
                case "+":
                case "=":
                    setZoom((z) => Math.min(z * 1.2, 5));
                    break;
                case "-":
                case "_":
                    setZoom((z) => Math.max(z / 1.2, 0.1));
                    break;
                case "i":
                case "I":
                    setInvert((prev) => !prev);
                    break;
                case "[": // CCW 90°
                    setRotation((r) => (r + 270) % 360);
                    break;
                case "]": // CW 90°
                    setRotation((r) => (r + 90) % 360);
                    break;
                case " ": // Space: Cine 토글
                    e.preventDefault();
                    setIsPlaying((p) => !p);
                    break;
                case "0": // Reset
                    setZoom(1);
                    setInvert(false);
                    setWindowCenter(40);
                    setWindowWidth(400);
                    setRotation(0);
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [imageIds.length]);

    // Cine 루프
    useEffect(() => {
        if (!isPlaying || imageIds.length <= 1) return;

        const step = (t: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = t;
            const dt = t - lastTimeRef.current;
            const interval = 1000 / fpsRef.current;
            if (dt >= interval) {
                setIndex((v) => (v + 1) % imageIds.length);
                lastTimeRef.current = t;
            }
            rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTimeRef.current = 0;
        };
    }, [isPlaying, imageIds.length]);

    // 오버레이 텍스트
    const overlayText = useMemo(
        () =>
            imageIds.length
                ? `Slice ${index + 1} / ${imageIds.length}  |  Zoom ${(zoom * 100).toFixed(0)}%  |  WL/WC ${windowWidth}/${windowCenter}  |  ${
                    invert ? "Inverted" : "Normal"
                }  |  Rot ${rotation}°`
                : "No image loaded",
        [imageIds.length, index, zoom, windowCenter, windowWidth, invert, rotation]
    );

    // 프리셋 적용
    const applyPreset = (name: string) => {
        const preset = WL_PRESETS[name];
        if (!preset) return;
        setWindowCenter(preset.wc);
        setWindowWidth(preset.ww);
    };

    return (
        <div className="h-screen w-screen bg-zinc-900 text-zinc-100 flex flex-col">
            {/* 상단 바 */}
            <div className="p-3 border-b border-zinc-800 flex items-center gap-2 flex-wrap">
                <div className="font-semibold mr-2">Local DICOM Viewer (no server)</div>

                {/* 파일 열기 */}
                <label className="text-sm">
                    <span className="px-3 py-1.5 border rounded cursor-pointer hover:bg-zinc-800">Open DICOM (.dcm)</span>
                    <input
                        type="file"
                        accept=".dcm,application/dicom,application/octet-stream"
                        multiple
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        className="hidden"
                    />
                </label>

                {/* 네비게이션 */}
                <div className="ml-4 flex items-center gap-2">
                    <button
                        className="px-2 py-1 border rounded disabled:opacity-40"
                        disabled={index === 0 || imageIds.length === 0}
                        onClick={() => setIndex((v) => Math.max(0, v - 1))}
                    >
                        Prev
                    </button>
                    <span className="text-xs opacity-70">{imageIds.length ? `${index + 1} / ${imageIds.length}` : "0 / 0"}</span>
                    <button
                        className="px-2 py-1 border rounded disabled:opacity-40"
                        disabled={imageIds.length === 0 || index >= imageIds.length - 1}
                        onClick={() => setIndex((v) => Math.min(imageIds.length - 1, v + 1))}
                    >
                        Next
                    </button>
                </div>

                {/* 줌 */}
                <div className="ml-4 flex items-center gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => setZoom((z) => Math.max(z / 1.2, 0.1))}>-</button>
                    <span className="text-xs opacity-70 min-w-10 text-center">{(zoom * 100).toFixed(0)}%</span>
                    <button className="px-2 py-1 border rounded" onClick={() => setZoom((z) => Math.min(z * 1.2, 5))}>+</button>
                    <button className="px-2 py-1 border rounded" onClick={() => setZoom(1)}>Reset Zoom</button>
                </div>

                {/* Invert & Reset */}
                <div className="ml-4 flex items-center gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => setInvert((v) => !v)}>{invert ? "Invert: On" : "Invert: Off"}</button>
                    <button
                        className="px-2 py-1 border rounded"
                        onClick={() => {
                            setZoom(1);
                            setInvert(false);
                            setWindowCenter(40);
                            setWindowWidth(400);
                            setRotation(0);
                        }}
                    >
                        Reset All (0)
                    </button>
                </div>

                {/* 회전 */}
                <div className="ml-4 flex items-center gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => setRotation((r) => (r + 270) % 360)}>
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <span className="text-xs opacity-70 w-12 text-center">{rotation}°</span>
                    <button className="px-2 py-1 border rounded" onClick={() => setRotation((r) => (r + 90) % 360)}>
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>

                {/* WL/WW 슬라이더 */}
                <div className="ml-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">WC</span>
                        <input type="range" min={-1200} max={1200} value={windowCenter} onChange={(e) => setWindowCenter(parseInt(e.target.value, 10))} />
                        <span className="text-xs opacity-70 w-10 text-right">{windowCenter}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">WW</span>
                        <input type="range" min={1} max={4000} value={windowWidth} onChange={(e) => setWindowWidth(parseInt(e.target.value, 10))} />
                        <span className="text-xs opacity-70 w-10 text-right">{windowWidth}</span>
                    </div>
                </div>

                {/* WL/WW 프리셋 */}
                <div className="ml-4 flex items-center gap-2">
                    {Object.keys(WL_PRESETS).map((name) => (
                        <button key={name} className="px-2 py-1 border rounded" onClick={() => applyPreset(name)}>
                            {name}
                        </button>
                    ))}
                </div>

                {/* 휠 동작, FPS, Cine */}
                <div className="ml-4 flex items-center gap-2">
                    <select
                        className="px-2 py-1 border rounded bg-zinc-900"
                        value={wheelBehavior}
                        onChange={(e) => setWheelBehavior(e.target.value as WheelMode)}
                        title="Wheel behavior"
                    >
                        <option value="slice">Wheel: Slice</option>
                        <option value="zoom">Wheel: Zoom</option>
                        <option value="mixed">Wheel: Mixed</option>
                    </select>
                    <label className="text-xs opacity-80 flex items-center gap-1">
                        FPS
                        <input
                            type="number"
                            className="w-14 px-2 py-1 border rounded bg-zinc-900"
                            defaultValue={fpsRef.current}
                            min={1}
                            max={60}
                            onChange={(e) => (fpsRef.current = Math.max(1, Math.min(60, Number(e.target.value) || 12)))}
                        />
                    </label>
                    {/* 툴바에 토글 */}
                    <label className="text-xs opacity-80 flex items-center gap-1">
                        <input
                            type="checkbox"
                            checked={interpolate}
                            onChange={(e) => setInterpolate(e.target.checked)}
                        />
                        Interpolation
                    </label>
                    <button
                        className={`px-2 py-1 border rounded ${isPlaying ? "bg-zinc-800" : ""}`}
                        onClick={() => setIsPlaying((p) => !p)}
                        disabled={imageIds.length <= 1}
                        title="Space"
                    >
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                </div>
            </div>

            {/* 드래그&드롭 영역 + 뷰포트 */}
            <div
                className="flex-1 relative"
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDrop={onDrop}
            >
                {imageIds.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 select-none">
                        파일을 드래그하거나 좌측 상단 버튼으로 열어주세요 (다중 파일 지원)
                    </div>
                ) : (
                    <>
                        {/* Cornerstone 뷰포트 */}
                        <CornerstoneViewport
                            imageIds={imageIds}
                            index={index}
                            onIndexChange={setIndex}
                            zoom={zoom}
                            invert={invert}
                            windowCenter={windowCenter}
                            windowWidth={windowWidth}
                            rotation={rotation}
                            fitToWindow
                            enablePrefetch
                            wheelBehavior={wheelBehavior}
                            zoomStep={0.2}
                            minZoom={0.1}
                            maxZoom={5}
                            interpolate={interpolate}   // ← 추가
                            className="w-full h-full"
                        />

                        {/* 좌상단 오버레이 */}
                        <div className="absolute left-2 top-2 text-xs bg-black/50 px-2 py-1 rounded">{overlayText}</div>

                        {/* 하단 슬라이더로 인덱스 이동 */}
                        <div className="absolute left-0 right-0 bottom-0 bg-black/30 py-2 px-3">
                            <input
                                type="range"
                                min={0}
                                max={Math.max(0, imageIds.length - 1)}
                                value={index}
                                onChange={(e) => setIndex(parseInt(e.target.value, 10))}
                                className="w-full"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* 도움말 */}
            <div className="p-2 text-xs text-zinc-400 border-t border-zinc-800 flex flex-wrap gap-4">
                <div>단축키: ←/→ 슬라이스, +/- 줌, I 반전, [ / ] 회전, Space 재생/일시정지, 0 초기화</div>
                <div>마우스 휠 동작: Slice / Zoom / Mixed</div>
            </div>
        </div>
    );
}
