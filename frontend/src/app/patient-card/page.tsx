"use client"

import React from "react"
import { PatientCard } from "@/components/medical/PatientCard"
import type { Patient } from "@/types/medical.types"
import { Header } from "@/components/layout/Header"

const mockPatient: Patient = {
  id: "demo-study-uid",
  patientId: "PT-DEMO-001",
  patientName: "홍길동",
  studyKey: 12345,
  modality: "CT",
  studyDescription: "Chest CT",
  images: [],
  birthDate: "1980-01-01",
  bodyPart: "CHEST",
  studyInstanceUID: "1.2.840.10008.1.2.1.1",
  seriesInstanceUID: "1.2.840.10008.1.2.1.2",
}

export default function PatientCardPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header currentView="search" />
      <div className="max-w-2xl mx-auto p-6">
        <PatientCard patient={mockPatient} />
      </div>
    </div>
  )
}


