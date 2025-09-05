"use client"

import type React from "react"
import { useState } from "react"
import { apiClient } from "@/lib/api"
import type { AuthResponse } from "@/lib/api"

interface SignupFormData {
    username: string
    password: string
    confirmPassword: string
    displayName: string
    phone: string
    position: string
}

export function useSignup() {
    const [formData, setFormData] = useState<SignupFormData>({
        username: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        phone: "",
        position: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        if (!formData.username || !formData.password || !formData.confirmPassword || 
            !formData.displayName || !formData.phone || !formData.position) {
            setError("모든 필수 항목을 입력해주세요.")
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.")
            return false
        }
        if (formData.password.length < 6) {
            setError("비밀번호는 최소 6자 이상이어야 합니다.")
            return false
        }
        // 전화번호 형식 검증
        const phoneRegex = /^010-\d{4}-\d{4}$/
        if (!phoneRegex.test(formData.phone)) {
            setError("전화번호는 010-XXXX-XXXX 형식으로 입력해주세요.")
            return false
        }
        return true
    }

    const handleSignup = async (onSuccess?: () => void) => {
        setError("")
        setSuccess("")
        if (!validateForm()) return

        const payload = {
            username: formData.username,
            password: formData.password,
            displayName: formData.displayName,
            phone: formData.phone,
            position: formData.position,
        }
        console.log("📦 Signup payload:", payload)

        setIsLoading(true)
        try {
            const res = await apiClient.signup(payload)
            console.log("✅ Signup response:", res)
            setSuccess("회원가입 요청이 제출되었습니다. 관리자 승인 후 로그인이 가능합니다.")
            onSuccess?.()
        } catch (e) {
            console.error("❌ Signup error:", e)
            const errorMessage = e instanceof Error ? e.message : "회원가입 중 오류가 발생했습니다."
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ 
            username: "", 
            password: "", 
            confirmPassword: "", 
            displayName: "",
            phone: "",
            position: ""
        })
        setError("")
        setSuccess("")
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    return {
        formData,
        setFormData,
        handleInputChange,
        showPassword, setShowPassword,
        showConfirmPassword, setShowConfirmPassword,
        isLoading, error, success,
        handleSignup,
        resetForm,
    }
}
