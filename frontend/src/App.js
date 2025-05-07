// // App.jsx
// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import AppRoutes from "./routes/AppRoutes";
// import { AuthProvider } from "./context/AuthContext";
// import Home from "./pages/Home";
// // import Notifications from "./components/Notifications";
// // import Events from "./components/Events";
// // import NoMatchfound from "./components/NoMatchfound";
// import Login from "./pages/Login";
// // import RequireAuth from "./components/RequireAuth";
// import Register from "./pages/Register";
// import Profile from "./pages/Profile";

// function App() {
//   return (

//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Home />}>
//             <Route index element={<Login />} />
//             <Route path="login" element={<Login />} />
//             <Route path="register" element={<Register />} />
//           </Route>
//           {/* <Route path="notifications" element={<Notifications />} />
//           <Route path="events" element={<Events />} /> */}
//           {/* <Route path="*" element={<NoMatchfound />} /> */}
//           {/* <Route path="admin/users" element={<Users />}>
//               <Route path=":userId" element={<UserDetails />} />
//               <Route path="admin" element={<AdminDetails />} />
//             </Route> */}
//           {/* <Route
//             path="profile"
//             element={
//               <RequireAuth>
//                 <Profile />
//               </RequireAuth>
//             }
//           ></Route> */}
//         </Routes>
//         <AppRoutes />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
// App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
