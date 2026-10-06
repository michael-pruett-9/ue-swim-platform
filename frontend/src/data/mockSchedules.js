// Entirely fictional prototype data; no real student-athlete information.
// Times use local 24-hour HH:MM strings on the specified weekday.
export const mockSchedules = [
  {
    id: 'mock-001',
    name: 'Mock Swimmer Alpha',
    classes: [
      { day: 'Monday', startTime: '09:00', endTime: '09:50', label: 'Sample Math' },
      { day: 'Monday', startTime: '13:00', endTime: '13:50', label: 'Sample Writing' },
      { day: 'Tuesday', startTime: '10:00', endTime: '11:15', label: 'Sample Science' },
    ],
  },
  {
    id: 'mock-002',
    name: 'Mock Swimmer Beta',
    classes: [
      { day: 'Monday', startTime: '10:00', endTime: '10:50', label: 'Sample History' },
      { day: 'Tuesday', startTime: '09:00', endTime: '10:15', label: 'Sample Math' },
      { day: 'Tuesday', startTime: '14:00', endTime: '15:15', label: 'Sample Art' },
    ],
  },
  {
    id: 'mock-003',
    name: 'Mock Swimmer Gamma',
    classes: [
      { day: 'Monday', startTime: '08:00', endTime: '08:50', label: 'Sample Science' },
      { day: 'Monday', startTime: '11:00', endTime: '11:50', label: 'Sample Computing' },
      { day: 'Tuesday', startTime: '13:00', endTime: '14:15', label: 'Sample Writing' },
    ],
  },
  {
    id: 'mock-004',
    name: 'Mock Swimmer Delta',
    classes: [
      { day: 'Monday', startTime: '14:00', endTime: '14:50', label: 'Sample Math' },
      { day: 'Tuesday', startTime: '08:00', endTime: '09:15', label: 'Sample History' },
      { day: 'Tuesday', startTime: '11:00', endTime: '12:15', label: 'Sample Computing' },
    ],
  },
  {
    id: 'mock-005',
    name: 'Mock Swimmer Epsilon',
    classes: [
      { day: 'Monday', startTime: '09:30', endTime: '10:20', label: 'Sample Writing' },
      { day: 'Monday', startTime: '12:00', endTime: '12:50', label: 'Sample Art' },
      { day: 'Tuesday', startTime: '15:00', endTime: '16:15', label: 'Sample Science'},
    ],
  },
];
