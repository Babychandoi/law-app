import React from 'react'
import ConsultationForm from '../../../component/Consultation'
import Contact from './Contact'

export default function Consultation() {
  return (
    <div className="flex flex-col lg:flex-row flex-wrap justify-center py-5 px-0 md:px-5 bg-gray-50">
      <div className="w-full lg:flex-1 lg:min-w-[280px] lg:max-w-[600px] p-0 md:p-5 bg-white md:rounded-2xl md:shadow-2xl m-0 md:m-5">
        <ConsultationForm />
      </div>
      <div className="w-full lg:flex-1 lg:min-w-[280px] lg:max-w-[600px] p-0 md:p-5 bg-white md:rounded-2xl md:shadow-2xl m-0 md:m-5">
        <Contact />
      </div>
    </div>
  )
}

