/**
 * 리팩토링된 의료 영상 뷰어 메인 애플리케이션
 */

'use client';

import React from 'react';
import { useNavigation, useApp } from '@/contexts/AppContext';
import ModernLoginPage from './auth/ModernLoginPage';
import SignupPage from './signup-page';
import { MainDashboard } from './pages/MainDashboard';
import { SearchPage } from './pages/SearchPage';
import { ViewerPage } from './pages/ViewerPage';

export default function MedicalViewerApp() {
    const { viewMode, navigateTo } = useNavigation();
    const { state: { selectedPatient } } = useApp();

  switch (viewMode) {
    case 'login':
      return <ModernLoginPage />;

      case 'signup':
          return (
              <SignupPage
                  onSignupSuccess={() => {
                      // 회원가입 성공 시 로그인 화면으로 보내기
                      navigateTo('login');
                  }}
                  onBackToLogin={() => {
                      // "로그인으로 돌아가기" 클릭 시 로그인 화면으로 이동
                      navigateTo('login');
                  }}
              />
          );
    
    case 'main':
      return <MainDashboard />;
    
    case 'search':
      return <SearchPage />;
    
    case 'viewer':
      // 선택된 환자의 식별자에서 우선순위대로 전달: studyInstanceUID > patientId > id
      const studyKey1 = selectedPatient.studyKey;
      return <ViewerPage studyKey={studyKey1} />;
    
    default:
      return <MainDashboard />;
  }
}
