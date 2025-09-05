"use client"

import { useState } from "react"
import { Search, FileText, ChevronUp, ChevronDown, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const mockPatients = [
  {
    id: "P001234",
    name: "김철수",
    gender: "M",
    age: 45,
    birthDate: "1978-03-15",
    lastVisit: "2024-01-15",
    examinations: [
      {
        equipment: "CT",
        description: "Chest CT with contrast",
        date: "2024-01-15",
        time: "14:30",
        series: 3,
        images: 120,
        studyId: "ST001",
      },
      {
        equipment: "CR",
        description: "Pneumonoultramicroscopicsilicovolcanoconiosis",
        date: "2024-01-10",
        time: "09:15",
        series: 1,
        images: 2,
        studyId: "ST002",
      },
    ],
  },
  {
    id: "P001235",
    name: "이영희",
    gender: "F",
    age: 32,
    birthDate: "1991-07-22",
    lastVisit: "2024-01-12",
    examinations: [
      {
        equipment: "MRI",
        description: "Brain MRI",
        date: "2024-01-12",
        time: "11:00",
        series: 5,
        images: 200,
        studyId: "ST003",
      },
    ],
  },
  {
    id: "P001236",
    name: "박민수",
    gender: "M",
    age: 28,
    birthDate: "1995-11-08",
    lastVisit: "2024-01-14",
    examinations: [
      {
        equipment: "US",
        description: "Abdominal Ultrasound",
        date: "2024-01-14",
        time: "16:45",
        series: 2,
        images: 45,
        studyId: "ST004",
      },
    ],
  },
  {
    id: "P001237",
    name: "최수진",
    gender: "F",
    age: 55,
    birthDate: "1968-04-30",
    lastVisit: "2024-01-13",
    examinations: [
      {
        equipment: "DR",
        description: "Mammography",
        date: "2024-01-13",
        time: "10:30",
        series: 4,
        images: 8,
        studyId: "ST005",
      },
    ],
  },
]

type SortField = "id" | "name" | "age" | "lastVisit"
type SortDirection = "asc" | "desc"

export default function PACSSystem() {
  const [searchPatientId, setSearchPatientId] = useState("")
  const [searchPatientName, setSearchPatientName] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const handlePatientIdChange = (value: string) => {
    setSearchPatientId(value)
    // If both search fields become empty, clear selected patient
    if (!value && !searchPatientName) {
      setSelectedPatient(null)
    }
  }

  const handlePatientNameChange = (value: string) => {
    setSearchPatientName(value)
    // If both search fields become empty, clear selected patient
    if (!value && !searchPatientId) {
      setSelectedPatient(null)
    }
  }

  const resetToPatientList = () => {
    setSelectedPatient(null)
  }

  const filteredAndSortedPatients =
    searchPatientId || searchPatientName
      ? mockPatients
          .filter(
            (patient) =>
              (searchPatientId === "" || patient.id.toLowerCase().includes(searchPatientId.toLowerCase())) &&
              (searchPatientName === "" || patient.name.toLowerCase().includes(searchPatientName.toLowerCase())),
          )
          .sort((a, b) => {
            let aValue: any = a[sortField]
            let bValue: any = b[sortField]

            if (sortField === "lastVisit") {
              aValue = new Date(aValue)
              bValue = new Date(bValue)
            }

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
            return 0
          })
      : []

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    )
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
  }

  const handleExaminationDoubleClick = (exam: any) => {
    // Navigate to image page - user will implement their own image page
    console.log("Navigate to image page for examination:", exam.studyId)
    // This is where the user would add their navigation logic
    // For example: router.push(`/images/${exam.studyId}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">의료진단뷰어</h1>
          </div>

          <nav className="flex gap-6 ml-8">
            <Button variant="ghost" className="text-white hover:bg-gray-700">
              Admin
            </Button>
            <Button variant="ghost" className="text-white hover:bg-gray-700">
              환자
            </Button>
          </nav>

          <div className="flex items-center gap-2 ml-auto text-sm text-gray-400">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToPatientList}
              className="text-gray-400 hover:text-white p-1"
            >
              <Home className="w-4 h-4" />
            </Button>
            <span>/</span>
            <span>환자 목록</span>
            {selectedPatient && (
              <>
                <span>/</span>
                <span className="text-white">{selectedPatient.name}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="p-6 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">환자 아이디:</label>
            <Input
              value={searchPatientId}
              onChange={(e) => handlePatientIdChange(e.target.value)}
              className="w-48 bg-gray-700 border-gray-600 text-white"
              placeholder="환자 아이디 입력"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">환자 이름:</label>
            <Input
              value={searchPatientName}
              onChange={(e) => handlePatientNameChange(e.target.value)}
              className="w-48 bg-gray-700 border-gray-600 text-white"
              placeholder="환자 이름 입력"
            />
          </div>

          <Button className="bg-red-600 hover:bg-red-700">
            <Search className="w-4 h-4 mr-2" />
            검색
          </Button>

          {(searchPatientId || searchPatientName) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchPatientId("")
                setSearchPatientName("")
                setSelectedPatient(null) // Reset selected patient when clearing search
              }}
              className="border-gray-600 text-black bg-white hover:bg-gray-100"
            >
              초기화
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>총 환자 건수: {filteredAndSortedPatients.length}</span>
          <span>•</span>
          <span>선택된 환자: {selectedPatient ? selectedPatient.name : "없음"}</span>
        </div>
      </div>

      <div className="p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">환자 목록</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!searchPatientId && !searchPatientName ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>환자 아이디 또는 환자 이름을 입력하여 검색하세요.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th
                        className="text-left p-3 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("id")}
                      >
                        환자 아이디 <SortIcon field="id" />
                      </th>
                      <th
                        className="text-left p-3 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        환자 이름 <SortIcon field="name" />
                      </th>
                      <th className="text-left p-3 text-gray-300">성별</th>
                      <th className="text-left p-3 text-gray-300">생년월일</th>
                      <th
                        className="text-left p-3 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("lastVisit")}
                      >
                        최근검사일 <SortIcon field="lastVisit" />
                      </th>
                      <th className="text-center p-3 text-gray-300">검사 건수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedPatients.map((patient, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                          selectedPatient?.id === patient.id ? "bg-gray-700 ring-1 ring-blue-500" : ""
                        }`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <td className="p-3 text-white font-mono">{patient.id}</td>
                        <td className="p-3 text-white font-medium">{patient.name}</td>
                        <td className="p-3">
                          <span className="text-gray-300">{patient.gender === "M" ? "남성" : "여성"}</span>
                        </td>
                        <td className="p-3 text-gray-300 font-mono text-sm">{patient.birthDate}</td>
                        <td className="p-3 text-gray-300 font-mono text-sm">{patient.lastVisit}</td>
                        <td className="p-3 text-center">
                          <span className="text-gray-300">{patient.examinations.length}건</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Examination Details - Shows when patient is selected */}
        {selectedPatient && (
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  검사 상세 정보 - {selectedPatient.name} ({selectedPatient.id})
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">총 {selectedPatient.examinations.length}건의 검사</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-gray-300 w-24">검사장비</th>
                      <th className="text-left p-3 text-gray-300 w-80">검사설명</th>
                      <th className="text-left p-3 text-gray-300 w-32">검사일시</th>
                      <th className="text-center p-3 text-gray-300 w-24">시리즈 수</th>
                      <th className="text-center p-3 text-gray-300 w-24">이미지 수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPatient.examinations.map((exam: any, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                        onDoubleClick={() => handleExaminationDoubleClick(exam)}
                        title="더블클릭하여 이미지 페이지로 이동"
                      >
                        <td className="p-3 w-24">
                          <span className="text-white">{exam.equipment}</span>
                        </td>
                        <td className="p-3 text-white w-80 break-words">{exam.description}</td>
                        <td className="p-3 text-gray-300 font-mono text-sm w-32">
                          <div>{exam.date}</div>
                          <div className="text-xs text-gray-500">{exam.time}</div>
                        </td>
                        <td className="p-3 text-center w-24">
                          <span className="text-white">{exam.series}</span>
                        </td>
                        <td className="p-3 text-center w-24">
                          <span className="text-white">{exam.images}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

