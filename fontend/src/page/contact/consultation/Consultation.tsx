import React from 'react'
import ConsultationForm from '../../../component/Consultation'
import Contact from './Contact'

export default function Consultation() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row', // default desktop
        flexWrap: 'wrap', // để auto xuống dòng nếu không đủ
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        textAlign: 'center',
        boxSizing: 'border-box',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          flex: '1 1 300px', // grow-shrink-basis
          maxWidth: '600px',
          minWidth: '280px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          margin: '20px',
        }}
      >
        <ConsultationForm />
      </div>
      <div
        style={{
          flex: '1 1 300px',
          maxWidth: '600px',
          minWidth: '280px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          margin: '20px',
        }}
      >
        <Contact />
      </div>
    </div>
  )
}

