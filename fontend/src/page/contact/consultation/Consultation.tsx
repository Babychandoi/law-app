import React from 'react'
import ConsultationForm from '../../../component/Consultation'
import Contact from './Contact'
export default function Consultation() {
  return (
    <div style={{
        display: 'flex',
        alignItems: 'center',
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

    }}>
        <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            margin: '20px auto'
        }}>
            <ConsultationForm />
        </div>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        margin: '20px auto'
      }}>
        <Contact />
      </div>

      
    </div>
  )
}
