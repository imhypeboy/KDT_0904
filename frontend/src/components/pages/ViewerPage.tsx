'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@/contexts/AppContext';
import { setupCornerstone } from '@/lib/cornerstone/setup';
import { useDicomStudy, useDicomLoadingState } from '@/hooks/useDicomData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ZoomIn, ZoomOut, Eye, Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CornerstoneViewport } from '@/components/viewer/CornerstoneViewport';
import { usePrefetchCornerstone } from '@/hooks/usePreFetchCornerStone';

interface ViewerPageProps {
    studyKey: number;
}
type WheelMode = 'stack' | 'zoom' | 'mixed';
// 기본 WL/WW 프리셋
const WL_PRESETS: Record<string, { wc: number; ww: number }> = {
    'Soft Tissue': { wc: 40, ww: 400 },
    Lung: { wc: -600, ww: 1500 },
    Bone: { wc: 300, ww: 1500 },
    Brain: { wc: 40, ww: 80 },
};

export function ViewerPage({ studyKey }: ViewerPageProps) {
    // Cornerstone 초기화
    useEffect(() => {
        setupCornerstone();
    }, []);

    const { navigateTo } = useNavigation();
    const { manifest, isLoading, error, progress, reload } = useDicomStudy(studyKey);
    const loadingState = useDicomLoadingState();

    // Series & 이미지 인덱스 상태
    const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 뷰포트 상태 (CornerstoneViewport prop으로 전달)
    const [zoom, setZoom] = useState(1);
    const [invert, setInvert] = useState(false);
    const [windowCenter, setWindowCenter] = useState(40);
    const [windowWidth, setWindowWidth] = useState(400);
    const [wheelBehavior, setWheelBehavior] = useState<WheelMode>('mixed');
    const [annotations, setAnnotations] = useState(true);
    const [interpolate, setInterpolate] = useState(true);

    // 회전 상태 (도 단위). CornerstoneViewport가 rotation prop을 지원한다면 사용
    const [rotation, setRotation] = useState(0);

    // Cine 재생
    const [isPlaying, setIsPlaying] = useState(false);
    const fpsRef = useRef(12);
    const rafRef = useRef<number | null>(null);
    const lastTimeRef = useRef(0);

    // Study 로드 시 첫 시리즈 자동 선택
    useEffect(() => {
        if (manifest && manifest.series.length > 0 && selectedSeriesIndex == null) {
            setSelectedSeriesIndex(0);
            setCurrentImageIndex(0);
        }
    }, [manifest, selectedSeriesIndex]);

    // 선택된 시리즈
    const selectedSeries =
        selectedSeriesIndex != null ? manifest?.series[selectedSeriesIndex] ?? null : null;

    // 현재 시리즈 imageIds (wadouri)
    const imageIds = useMemo(() => {
        return (selectedSeries?.instances ?? [])
            .map((inst) => inst.fileUrl)
            .filter((u): u is string => !!u)
            .map((u) => `wadouri:${u}`);
    }, [selectedSeries]);

    // 인접 슬라이스 프리페치
    usePrefetchCornerstone(imageIds, currentImageIndex);

    // 시리즈 선택 시 상태 초기화
    const handleSeriesSelect = (idx: number) => {
        setSelectedSeriesIndex(idx);
        setCurrentImageIndex(0);
        setZoom(1);
        setInvert(false);
        setWindowCenter(40);
        setWindowWidth(400);
        setRotation(0);
    };

    // 슬라이스 이동
    const handleImageNavigation = (dir: 'prev' | 'next') => {
        if (!imageIds.length) return;
        if (dir === 'prev') setCurrentImageIndex((v) => Math.max(0, v - 1));
        else setCurrentImageIndex((v) => Math.min(imageIds.length - 1, v + 1));
    };

    // 줌 제어
    const handleZoom = (dir: 'in' | 'out') => {
        setZoom((z) => (dir === 'in' ? Math.min(z * 1.2, 5) : Math.max(z / 1.2, 0.1)));
    };

    // 전체 리셋
    const resetAll = () => {
        setZoom(1);
        setInvert(false);
        setWindowCenter(40);
        setWindowWidth(400);
        setRotation(0);
    };

    // Cine 루프
    useEffect(() => {
        if (!isPlaying || imageIds.length <= 1) return;
        const step = (t: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = t;
            const dt = t - lastTimeRef.current;
            const interval = 1000 / fpsRef.current;
            if (dt >= interval) {
                setCurrentImageIndex((v) => (v + 1) % imageIds.length);
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

    // 좌상단 오버레이 텍스트
    const overlayText = useMemo(() => {
        return imageIds.length
            ? `Slice ${currentImageIndex + 1}/${imageIds.length} | Zoom ${(zoom * 100).toFixed(0)}% | WL/WC ${windowWidth}/${windowCenter} | ${
                invert ? 'Inverted' : 'Normal'
            } | Rot ${rotation}°`
            : 'No image';
    }, [imageIds.length, currentImageIndex, zoom, windowCenter, windowWidth, invert, rotation]);

    // 로딩/에러/빈 상태 처리
    if (studyKey == null) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-300 mb-4">DICOM 뷰어</h2>
                    <p className="text-gray-500 mb-6">Study가 선택되지 않았습니다.</p>
                    <Button onClick={() => navigateTo('search')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />검색으로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-300 mb-4">DICOM 로딩 중...</h2>
                    <div className="w-64 bg-gray-700 rounded-full h-2 mb-4">
                        <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-gray-500">{progress.toFixed(0)}% 완료</p>
                    {loadingState.currentFile && (
                        <p className="text-sm text-gray-600 mt-2">로딩 중: {loadingState.currentFile}</p>
                    )}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">로딩 오류</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <div className="space-x-4">
                        <Button onClick={reload} variant="outline">
                            다시 시도
                        </Button>
                        <Button onClick={() => navigateTo('search')} variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-2" />돌아가기
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!manifest) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-300 mb-4">데이터 없음</h2>
                    <p className="text-gray-500">DICOM 데이터를 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* 공용 헤더 */}
            <Header currentView="viewer" />

            {/* 스터디 정보 바 */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button onClick={() => navigateTo('search')} variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />돌아가기
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div>
                            <h1 className="text-lg font-semibold text-gray-100">{manifest.study.patientName}</h1>
                            <p className="text-sm text-gray-400">
                                {manifest.study.studyDescription} • {manifest.study.studyDate}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {manifest.study.modality && <Badge variant="outline">{manifest.study.modality}</Badge>}
                        <Badge variant="secondary">{manifest.study.numberOfSeries} Series</Badge>
                        <Badge variant="secondary">{manifest.study.numberOfInstances} Images</Badge>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* 사이드바 - Series 목록 */}
                <div className="w-80 bg-gray-850 border-r border-gray-700 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-md font-semibold text-gray-200 mb-4">Series 목록</h3>
                        <div className="space-y-2">
                            {manifest.series.map((series, idx) => (
                                <Card
                                    key={series.seriesInstanceUID}
                                    className={`cursor-pointer transition-all ${
                                        selectedSeriesIndex === idx
                                            ? 'border-red-500 bg-red-900/20'
                                            : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                    onClick={() => handleSeriesSelect(idx)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-gray-200">
                                            Series {series.seriesNumber ?? idx + 1}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-xs text-gray-400 mb-2">
                                            {series.seriesDescription ?? '(no description)'}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="text-xs">
                                                {series.modality}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                        {series.numberOfInstances} images
                      </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 메인 뷰어 영역 */}
                <div className="flex-1 flex flex-col">
                    {/* 뷰어 툴바 */}
                    <div className="bg-gray-800 border-b border-gray-700 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-wrap gap-2">
                                {/* 줌 */}
                                <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-400 min-w-16 text-center">{(zoom * 100).toFixed(0)}%</span>
                                <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6" />

                                {/* 회전 (옵션) */}
                                <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                                    <RotateCw className="w-4 h-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6" />

                                {/* 반전 */}
                                <Button
                                    variant={invert ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setInvert((v) => !v)}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>

                                {/* WL/WC 슬라이더 */}
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="text-xs text-gray-400">WC</span>
                                    <input
                                        type="range"
                                        min={-1200}
                                        max={1200}
                                        value={windowCenter}
                                        onChange={(e) => setWindowCenter(parseInt(e.target.value, 10))}
                                    />
                                    <span className="text-xs text-gray-400 w-10 text-right">{windowCenter}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">WW</span>
                                    <input
                                        type="range"
                                        min={1}
                                        max={4000}
                                        value={windowWidth}
                                        onChange={(e) => setWindowWidth(parseInt(e.target.value, 10))}
                                    />
                                    <span className="text-xs text-gray-400 w-10 text-right">{windowWidth}</span>
                                </div>

                                {/* 프리셋 */}
                                <div className="flex items-center gap-2 ml-2">
                                    {Object.keys(WL_PRESETS).map((name) => (
                                        <Button
                                            key={name}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setWindowCenter(WL_PRESETS[name].wc);
                                                setWindowWidth(WL_PRESETS[name].ww);
                                            }}
                                        >
                                            {name}
                                        </Button>
                                    ))}
                                </div>

                                {/* 휠 동작 */}
                                <select
                                    className="ml-2 px-2 py-1 border rounded bg-gray-900 text-sm"
                                    value={wheelBehavior}
                                    onChange={(e) => setWheelBehavior(e.target.value as any)}
                                    title="Wheel behavior"
                                >
                                    <option value="slice">Wheel: Slice</option>
                                    <option value="zoom">Wheel: Zoom</option>
                                    <option value="mixed">Wheel: Mixed</option>
                                </select>

                                {/* 주석 토글 */}
                                <label className="ml-2 text-xs text-gray-300 flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={annotations}
                                        onChange={(e) => setAnnotations(e.target.checked)}
                                    />
                                    Annotations
                                </label>
                                {/* 툴바에 토글 추가 */}
                                <label className="ml-2 text-xs text-gray-300 flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={interpolate}
                                        onChange={(e) => setInterpolate(e.target.checked)}
                                    />
                                    Interpolation
                                </label>
                                {/* 전체 리셋 */}
                                <Button className="ml-2" variant="outline" size="sm" onClick={resetAll}>
                                    Reset
                                </Button>
                            </div>

                            {/* 씨네 컨트롤 */}
                            {selectedSeries && imageIds.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-400">
                                        이미지 {currentImageIndex + 1} / {imageIds.length}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentImageIndex((v) => Math.max(0, v - 1))}
                                            disabled={currentImageIndex === 0}
                                        >
                                            이전
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentImageIndex((v) => Math.min(imageIds.length - 1, v + 1))}
                                            disabled={currentImageIndex >= imageIds.length - 1}
                                        >
                                            다음
                                        </Button>
                                        <div className="flex items-center gap-2 ml-2">
                                            <input
                                                type="number"
                                                className="w-14 px-2 py-1 border rounded bg-gray-900 text-sm"
                                                defaultValue={fpsRef.current}
                                                min={1}
                                                max={60}
                                                onChange={(e) => (fpsRef.current = Math.max(1, Math.min(60, Number(e.target.value) || 12)))}
                                                title="FPS"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsPlaying((p) => !p)}
                                                disabled={imageIds.length <= 1}
                                                title="Space"
                                            >
                                                {isPlaying ? (
                                                    <span className="flex items-center gap-1"><Pause className="w-4 h-4" /> Pause</span>
                                                ) : (
                                                    <span className="flex items-center gap-1"><Play className="w-4 h-4" /> Play</span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 이미지 표시 영역 */}
                    <div className="flex-1 bg-black relative overflow-hidden">
                        {imageIds.length > 0 ? (
                            <>
                                {/* Cornerstone 단일 뷰포트: 모든 prop 적용 */}
                                <CornerstoneViewport
                                    imageIds={imageIds}
                                    index={currentImageIndex}
                                    onIndexChange={setCurrentImageIndex}
                                    zoom={zoom}
                                    invert={invert}
                                    windowCenter={windowCenter}
                                    windowWidth={windowWidth}
                                    fitToWindow
                                    enablePrefetch
                                    wheelBehavior={wheelBehavior}
                                    zoomStep={0.2}
                                    minZoom={0.1}
                                    maxZoom={5}
                                    rotation={rotation as any}
                                    interpolate={interpolate}   // ← 추가
                                    className="w-full h-full"
                                />

                                {/* 좌상단 오버레이 */}
                                {annotations && (
                                    <div className="absolute left-2 top-2 text-xs bg-black/50 text-gray-100 px-2 py-1 rounded">
                                        {overlayText}
                                    </div>
                                )}

                                {/* 하단 인덱스 슬라이더 */}
                                <div className="absolute left-0 right-0 bottom-0 bg-black/30 py-2 px-3">
                                    <input
                                        type="range"
                                        min={0}
                                        max={Math.max(0, imageIds.length - 1)}
                                        value={currentImageIndex}
                                        onChange={(e) => setCurrentImageIndex(parseInt(e.target.value, 10))}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                Series를 선택해주세요
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
