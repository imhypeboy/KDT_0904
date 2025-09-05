/**
 * 회원관리 페이지 - 어드민 전용
 */

"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { 
    Check, 
    X, 
    Clock, 
    User, 
    Phone, 
    Briefcase,
    Calendar,
    RefreshCw
} from "lucide-react"
import { SignupRequest, SignupStatus, ApprovalRequest } from "@/types/medical.types"

export default function UserManagementPage() {
    const [requests, setRequests] = useState<SignupRequest[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [showRejectionModal, setShowRejectionModal] = useState(false)
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

    // 목 데이터 - 실제로는 API에서 가져올 데이터
    const mockRequests: SignupRequest[] = [
        {
            id: "req001",
            name: "허재은",
            username: "chaeeun",
            phone: "010-4539-1365",
            position: "doctor",
            status: "pending",
            requestDate: "2024-06-28T12:50:00Z"
        },
        {
            id: "req002", 
            name: "김철수",
            username: "cheolsu",
            phone: "010-4361-2452",
            position: "doctor",
            status: "pending",
            requestDate: "2024-07-05T02:30:00Z"
        }
    ]

    useEffect(() => {
        // 실제로는 API 호출
        setRequests(mockRequests)
    }, [])

    const handleApproval = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
        setIsLoading(true)
        
        try {
            // 실제로는 API 호출
            const approvalRequest: ApprovalRequest = {
                requestId,
                action,
                reason
            }
            
            // 목 처리
            setRequests(prev => prev.map(req => {
                if (req.id === requestId) {
                    const now = new Date().toISOString()
                    if (action === 'approve') {
                        return {
                            ...req,
                            status: 'approved' as SignupStatus,
                            approvedDate: now,
                            approvedBy: 'admin' // 실제로는 현재 로그인한 사용자 ID
                        }
                    } else {
                        return {
                            ...req,
                            status: 'rejected' as SignupStatus,
                            rejectedDate: now,
                            rejectedBy: 'admin',
                            rejectionReason: reason
                        }
                    }
                }
                return req
            }))

            console.log(`${action === 'approve' ? '승인' : '거절'} 처리 완료:`, approvalRequest)
            
        } catch (error) {
            console.error('승인/거절 처리 중 오류:', error)
        } finally {
            setIsLoading(false)
            setShowRejectionModal(false)
            setRejectionReason("")
            setSelectedRequestId(null)
        }
    }

    const handleReject = (requestId: string) => {
        setSelectedRequestId(requestId)
        setShowRejectionModal(true)
    }

    const confirmReject = () => {
        if (selectedRequestId) {
            handleApproval(selectedRequestId, 'reject', rejectionReason)
        }
    }

    const getStatusBadge = (status: SignupStatus) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />대기중</Badge>
            case 'approved':
                return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />승인됨</Badge>
            case 'rejected':
                return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />거절됨</Badge>
        }
    }

    const getPositionLabel = (position: string) => {
        const positions: { [key: string]: string } = {
            'doctor': '의사',
            'specialist': '전문의',
            'professor': '교수',
            'resident': '레지던트',
            'technician': '기사',
            'nurse': '간호사'
        }
        return positions[position] || position
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }


    return (
        <div className="min-h-screen bg-gray-800 flex flex-col">
            {/* 헤더 */}
            <Header currentView="user-management" />
            
            <div className="flex flex-1">
                {/* 사이드바 */}
                <Sidebar currentView="user-management" />
                
                {/* 메인 컨텐츠 */}
                <div className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* 페이지 헤더 */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">회원관리</h1>
                                <p className="text-gray-300 mt-1">회원가입 요청을 승인하거나 거절할 수 있습니다</p>
                            </div>
                            <Button 
                                onClick={() => window.location.reload()} 
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                새로고침
                            </Button>
                        </div>


                {/* 요청 목록 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <Card key={request.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {request.name}
                                    </CardTitle>
                                    {getStatusBadge(request.status)}
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">아이디:</span>
                                        <span className="font-medium">{request.username}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">직급:</span>
                                        <span className="font-medium">{getPositionLabel(request.position)}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">연락처:</span>
                                        <span className="font-medium">{request.phone}</span>
                                    </div>
                                    
                                    
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">신청일시:</span>
                                        <span className="font-medium text-xs">{formatDate(request.requestDate)}</span>
                                    </div>
                                </div>

                                {/* 승인/거절 정보 */}
                                {request.status === 'approved' && request.approvedDate && (
                                    <div className="bg-green-50 p-3 rounded-md">
                                        <p className="text-sm text-green-800">
                                            <strong>승인일시:</strong> {formatDate(request.approvedDate)}
                                        </p>
                                    </div>
                                )}

                                {request.status === 'rejected' && request.rejectedDate && (
                                    <div className="bg-red-50 p-3 rounded-md">
                                        <p className="text-sm text-red-800">
                                            <strong>거절일시:</strong> {formatDate(request.rejectedDate)}
                                        </p>
                                        {request.rejectionReason && (
                                            <p className="text-sm text-red-700 mt-1">
                                                <strong>거절 사유:</strong> {request.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 액션 버튼 */}
                                {request.status === 'pending' && (
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={() => handleApproval(request.id, 'approve')}
                                            disabled={isLoading}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            size="sm"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            승인
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(request.id)}
                                            disabled={isLoading}
                                            variant="destructive"
                                            className="flex-1"
                                            size="sm"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            거절
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                        {requests.length === 0 && (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">요청이 없습니다.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            
            {/* 거절 사유 모달 */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-black">거절 사유 입력</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="거절 사유를 입력해주세요..."
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-black"
                            rows={4}
                        />
                        <div className="flex gap-2 mt-4">
                            <Button
                                onClick={() => setShowRejectionModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={confirmReject}
                                variant="destructive"
                                className="flex-1"
                                disabled={!rejectionReason.trim()}
                            >
                                거절
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
