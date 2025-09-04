"use client"

import React, { useEffect } from "react"
import MedicalViewerApp from "@/components/MedicalViewerApp"
import { useNavigation } from "@/contexts/AppContext"

export default function SearchPreviewPage() {
  const { navigateTo } = useNavigation()
  useEffect(() => {
    // 로그인 우회: 바로 검색 화면으로 이동
    navigateTo("search")
  }, [navigateTo])
  return <MedicalViewerApp />
}


