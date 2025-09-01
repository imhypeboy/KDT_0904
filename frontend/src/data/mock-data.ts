/**
 * 개발용 목 데이터
 */

import { Patient, User } from '@/types/medical.types';

// 목 환자 데이터
export const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: '김철수',
    age: 45,
    gender: 'M',
    studyDate: '2024-01-15',
    modality: 'CT',
    studyDescription: 'Chest CT',
    images: [
      'wadouri:/dicom/chest-ct-001.dcm',
      'wadouri:/dicom/chest-ct-002.dcm',
      'wadouri:/dicom/chest-ct-003.dcm',
      'wadouri:/dicom/chest-ct-004.dcm',
      'wadouri:/dicom/chest-ct-005.dcm',
    ],
    birthDate: '1979-03-15',
    patientId: 'PT001',
    studyInstanceUID: '1.2.840.10008.1.2.1.1',
    seriesInstanceUID: '1.2.840.10008.1.2.1.2',
  },
  {
    id: 'P002',
    name: '이영희',
    age: 32,
    gender: 'F',
    studyDate: '2024-01-14',
    modality: 'MRI',
    studyDescription: 'Brain MRI',
    images: [
      'wadouri:/dicom/brain-mri-001.dcm',
      'wadouri:/dicom/brain-mri-002.dcm',
      'wadouri:/dicom/brain-mri-003.dcm',
    ],
    birthDate: '1992-07-20',
    patientId: 'PT002',
    studyInstanceUID: '1.2.840.10008.1.2.2.1',
    seriesInstanceUID: '1.2.840.10008.1.2.2.2',
  },
  {
    id: 'P003',
    name: '박민수',
    age: 58,
    gender: 'M',
    studyDate: '2024-01-13',
    modality: 'X-Ray',
    studyDescription: 'Chest X-Ray',
    images: [
      'wadouri:/dicom/chest-xray-001.dcm',
      'wadouri:/dicom/chest-xray-002.dcm',
    ],
    birthDate: '1966-11-08',
    patientId: 'PT003',
    studyInstanceUID: '1.2.840.10008.1.2.3.1',
    seriesInstanceUID: '1.2.840.10008.1.2.3.2',
  },
  {
    id: 'P004',
    name: '정수빈',
    age: 28,
    gender: 'F',
    studyDate: '2024-01-12',
    modality: 'US',
    studyDescription: 'Abdominal Ultrasound',
    images: [
      'wadouri:/dicom/abdominal-us-001.dcm',
      'wadouri:/dicom/abdominal-us-002.dcm',
      'wadouri:/dicom/abdominal-us-003.dcm',
      'wadouri:/dicom/abdominal-us-004.dcm',
    ],
    birthDate: '1996-02-14',
    patientId: 'PT004',
    studyInstanceUID: '1.2.840.10008.1.2.4.1',
    seriesInstanceUID: '1.2.840.10008.1.2.4.2',
  },
  {
    id: 'P005',
    name: '최동현',
    age: 67,
    gender: 'M',
    studyDate: '2024-01-11',
    modality: 'MRI',
    studyDescription: 'Lumbar Spine MRI',
    images: [
      'wadouri:/dicom/lumbar-mri-001.dcm',
      'wadouri:/dicom/lumbar-mri-002.dcm',
      'wadouri:/dicom/lumbar-mri-003.dcm',
      'wadouri:/dicom/lumbar-mri-004.dcm',
      'wadouri:/dicom/lumbar-mri-005.dcm',
      'wadouri:/dicom/lumbar-mri-006.dcm',
    ],
    birthDate: '1957-09-22',
    patientId: 'PT005',
    studyInstanceUID: '1.2.840.10008.1.2.5.1',
    seriesInstanceUID: '1.2.840.10008.1.2.5.2',
  },
];

// 목 사용자 데이터
export const mockUsers: User[] = [
  {
    id: 'U001',
    username: 'admin',
    name: '관리자',
    email: 'admin@hospital.com',
    role: 'admin',
    permissions: [
      'view_images',
      'edit_annotations',
      'delete_images',
      'manage_users',
      'export_images',
      'print_images',
    ],
    lastLogin: '2024-01-15T09:00:00Z',
    isActive: true,
  },
  {
    id: 'U002',
    username: 'doctor01',
    name: '김의사',
    email: 'doctor01@hospital.com',
    role: 'doctor',
    permissions: [
      'view_images',
      'edit_annotations',
      'export_images',
      'print_images',
    ],
    lastLogin: '2024-01-15T08:30:00Z',
    isActive: true,
  },
  {
    id: 'U003',
    username: 'tech01',
    name: '이기사',
    email: 'tech01@hospital.com',
    role: 'technician',
    permissions: [
      'view_images',
      'edit_annotations',
    ],
    lastLogin: '2024-01-15T08:00:00Z',
    isActive: true,
  },
];

// 환자 검색 함수
export const searchPatients = (
  searchTerm: string,
  patients: Patient[] = mockPatients
): Patient[] => {
  if (!searchTerm.trim()) {
    return [];
  }

  const term = searchTerm.toLowerCase();
  
  return patients.filter(patient => 
    patient.name.toLowerCase().includes(term) ||
    patient.id.toLowerCase().includes(term) ||
    patient.patientId?.toLowerCase().includes(term) ||
    patient.modality.toLowerCase().includes(term) ||
    patient.studyDescription.toLowerCase().includes(term)
  );
};

// 사용자 인증 함수 (목 구현)
export const authenticateUser = (
  username: string,
  password: string
): User | null => {
  // 개발용 간단한 인증 로직
  if (username === 'admin' && password === 'admin') {
    return mockUsers[0];
  }
  if (username === 'doctor' && password === 'doctor') {
    return mockUsers[1];
  }
  if (username === 'tech' && password === 'tech') {
    return mockUsers[2];
  }
  
  return null;
};

// 환자 ID로 환자 정보 조회
export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find(patient => patient.id === id);
};

// 모달리티별 환자 필터링
export const getPatientsByModality = (modality: string): Patient[] => {
  return mockPatients.filter(patient => 
    patient.modality.toLowerCase() === modality.toLowerCase()
  );
};

// 날짜 범위로 환자 필터링
export const getPatientsByDateRange = (
  startDate: string, 
  endDate: string
): Patient[] => {
  return mockPatients.filter(patient => {
    const studyDate = new Date(patient.studyDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return studyDate >= start && studyDate <= end;
  });
};
