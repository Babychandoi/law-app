import React from 'react'
import Consultation from './consultation/Consultation';
import { GoogleMap} from './googleMap/index';
import HeroSection from '../../component/sections/HeroSection';
export default function Contact() {
  return (
    <>
        <HeroSection
            title="Contact Us"
            subtitle="We are here to assist you. Reach out to us for any inquiries or support." />
      <Consultation />
      <GoogleMap/>
    </>
  )
}
