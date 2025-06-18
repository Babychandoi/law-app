
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
            path : '/recruitment/:id',
            element: (<Job />),
        },{
            path: '/service/brand/:id',
            element: (<Brand />)
        },{
            path: '/service/:id',
            element: (<Service />)
        },{
            path: '/service/copyright/:id',
            element: (<CopyRight />)
        },{
            path :"/service/design/:id",
            element : (<Design />)
        },{
            path :"/service/invention/:id",
            element : (<Invention />)
        },{
            path : "/service/violate/:id",
            element : (<Violate />)
        },{
            path :"/serviceDif/:id",
            element : (<ServiceDif />)
        },{
            path : "/serviceDif/barcodeNumber/:id",
            element : (<BarcodeNumber />)
        },{
            path : "/serviceDif/scienceTechnologyEnterprises/:id",
            element : (<ScienceTechnologyEnterprises />)
        },{
            path : "/serviceDif/socialMedia/:id",
            element : (<SocialMedia />)
        },
        {
            path : "/serviceDif/consultationOfDraftingContracts/:id",
            element : (<ConsultationOfDraftingContracts />)
        },{
            path : "/news",
            element : (<News />)
        },{
            path : "/news/:id",
            element : (<NewsDetail />)
        }
            
    ]
    

}