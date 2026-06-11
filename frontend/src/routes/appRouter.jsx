import {BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardEstudiante from "../pages/Estudiante/DashboardEstudiante";
import DashboardAdmin from "../pages/Universidad/DashboardAdmin";
import DashboardEmpresa from "../pages/Empresa/DashboardEmpresa";
import SubmitCv from "../pages/Estudiante/SubmitCv";
import ApplyPasantias from "../pages/Estudiante/ApplyPasantia";
import PostOfertas from "../pages/Empresa/PostOfertas";
import ManageOfertas from "../pages/Empresa/ManageOfertas";
import AjustesCuenta from "../pages/Usuario/AjustesCuenta";
import Soporte from "../pages/Usuario/Soporte";
import MiCuenta from "../pages/Usuario/MiCuenta";
import MyCV from "../pages/Estudiante/MyCV";
import ViewCV from "../pages/Estudiante/ViewCV";
import ValidarEstudiantes from "../pages/Universidad/ValidarEstudiantes";
import ValidarEmpresas from "../pages/Universidad/ValidateEmpresas";
import GenerateStatistics from "../pages/Universidad/GenerateStatics";
import Premium from "../pages/Usuario/Premium";
import Checkout from "../pages/Usuario/Checkout";
export default function AppRouter() {
  return (
    <Routes>
      //rutas generales
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      //rutas de usuario 
            <Route path="/ajustesCuenta" element={<AjustesCuenta />} />
           <Route path="/soporte" element={<Soporte />} />
            <Route path="/Micuenta" element={<MiCuenta />} />
            <Route
  path="/premium/checkout"
  element={<Checkout />}
/>
      //rutas del estudiante
      <Route path="/student" element={<DashboardEstudiante />} />
       <Route path="/Cv" element={<SubmitCv/>}/>
       <Route path="/aplicarpasantia" element={<ApplyPasantias/>}/>
       <Route path="/estudiante" element={<DashboardEstudiante />} />
      <Route path="/cv" element={<MyCV />} />
      <Route path="/student/cv/view/:studentId" element={<ViewCV />} />


        //rutas del la compañia
        <Route path="/company" element={<DashboardEmpresa />} />
        <Route path="/PostOfertas" element={<PostOfertas/>}/>
         <Route path="/manejarOfertas" element={<ManageOfertas/>}/>
         <Route 
  path="/empresa" 
  element={
    <DashboardEmpresa 
      empresaId={localStorage.getItem("empresaId")} 
    />
  } 
/>
        //rutas de la Universidad
        <Route path="/university" element={<DashboardAdmin />} />
        <Route path="/validate-students" element={<ValidarEstudiantes />} />
        <Route path="/validate-companies" element={<ValidarEmpresas />} />
        <Route path="/generate-statistics" element={<GenerateStatistics />} />

     
     
       
    </Routes>
  );
}