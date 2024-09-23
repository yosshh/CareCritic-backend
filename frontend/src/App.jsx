import FeatureSection from "./components/FeatureSection"
import HeroSection from "./components/HeroSection"
import Navbar from "./components/Navbar"
import Testimonials from "./components/Testimonials"


function App() {
  
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto pt-20 px-6">
        <HeroSection />
      </div>
      <div className="max-w-7xl mx-auto pt-20 px-6">
        <FeatureSection />
      </div>
      <div className="max-w-7xl mx-auto pt-20 px-6">
        <Testimonials />
      </div>
    </>
  )
}

export default App
