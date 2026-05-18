
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
            path :'/ve-chung-toi',
            element :(<About />),
        },{
            path : '/lien-he',
            element: (<Contact />),
        },{
            path : '/tuyen-dung',
            element: (<Recruitment />)
        },{
            path : '/tuyen-dung/vi-tri/:id',
            element: (<Job />),
        },{
            path: '/dang-ky-bao-ho-nhan-hieu',
            element: (<Brand />)
        },{
            path: '/dich-vu',
            element: (<Service />)
        },{
            path: '/dang-ky-bao-ho-ban-quyen',
            element: (<CopyRight />)
        },{
            path :"/bao-ho-kieu-dang-cong-nghiep",
            element : (<Design />)
        },{
            path :"/bao-ho-sang-che-giai-phap-huu-ich",
            element : (<Invention />)
        },{
            path : "/xu-ly-xam-pham",
            element : (<Violate />)
        },{
            path :"/dich-vu-khac",
            element : (<ServiceDif />)
        },{
            path : "/ma-so-ma-vach",
            element : (<BarcodeNumber />)
        },{
            path : "/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe",
            element : (<ScienceTechnologyEnterprises />)
        },{
            path : "/dang-ky-giay-phep-mang-xa-hoi",
            element : (<SocialMedia />)
        },
        {
            path : "/tu-van-soan-thao-hop-dong",
            element : (<ConsultationOfDraftingContracts />)
        },{
            path : "/tin-tuc",
            element : (<News />)
        },{
            path : "/tin-tuc/:id",
            element : (<NewsDetail />)
        }
            
    ]
    

}