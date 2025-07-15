
import Dashboard from "../page/Dashboard"
import Home from "../page/home/Home"
import About from "../page/aboutUs/index"
import Contact from "../page/contact/index"
import Recruitment from "../page/recruitment/recruitment"
import Job from "../page/recruitment/Job"
import Service from "../page/service/index"
import Brand from "../page/service/brand/index"
import CopyRight from "../page/service/copyright/index"
import Design from "../page/service/design/index"
import Invention from "../page/service/invention/index"
import Violate from "../page/service/violate/index"
import ServiceDif from "../page/servicedif/index"
import BarcodeNumber from "../page/servicedif/barcodeNumber/index"
import ScienceTechnologyEnterprises from "../page/servicedif/scienceTechnologyEnterprises/index"
import SocialMedia from "../page/servicedif/socialMedia/index"
import ConsultationOfDraftingContracts from "../page/servicedif/consultationOfDraftingContracts/index"
import News from "../page/news/index"
import NewsDetail from "../page/news/section/New"
export const indexRouter: any = {
    path: '/',
    element: (<Dashboard />),
    children: [
        {
            path : '/',
            element: ( <Home />),
        },{
            path :'/about',
            element :(<About />),
        },{
            path : '/contact',
            element: (<Contact />),
        },{
            path : '/recruitment',
            element: (<Recruitment />)
        },{
            path : '/recruitment/job',
            element: (<Job />),
        },{
            path: '/service/brand',
            element: (<Brand />)
        },{
            path: '/service',
            element: (<Service />)
        },{
            path: '/service/copyright',
            element: (<CopyRight />)
        },{
            path :"/service/design",
            element : (<Design />)
        },{
            path :"/service/invention",
            element : (<Invention />)
        },{
            path : "/service/violate",
            element : (<Violate />)
        },{
            path :"/serviceDif",
            element : (<ServiceDif />)
        },{
            path : "/serviceDif/barcodeNumber",
            element : (<BarcodeNumber />)
        },{
            path : "/serviceDif/scienceTechnologyEnterprises",
            element : (<ScienceTechnologyEnterprises />)
        },{
            path : "/serviceDif/socialMedia",
            element : (<SocialMedia />)
        },
        {
            path : "/serviceDif/consultationOfDraftingContracts",
            element : (<ConsultationOfDraftingContracts />)
        },{
            path : "/news",
            element : (<News />)
        },{
            path : "/new",
            element : (<NewsDetail />)
        }
            
    ]
    

}