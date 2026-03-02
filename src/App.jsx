import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import TestSeriesList from "./pages/admin/TestSeriesList";
import CreateTestSeries from "./pages/admin/CreateTestSeries";
import ManageTests from "./pages/admin/ManageTests";
import ManageQuestions from "./pages/admin/ManageQuestions";
import StudentDashboard from "./pages/student/Dashboard";
import AllTestSeries from "./pages/student/AllTestSeries";
import MyTests from "./pages/student/MyTests";
import Performance from "./pages/student/Performance";
import PurchaseHistory from "./pages/student/PurchaseHistory";
import Enrollment from "./pages/admin/Enrollments";
import CreateTest from "./pages/admin/CreateTest";
import Users from "./pages/admin/Users";
import AttemptInstruction from "./pages/student/AttemptInstruction";
import ExamWindow from "./pages/student/ExamWindow";
import QuestionsTablePage from "./pages/admin/TestDetails";
import RecentPerformance from "./pages/student/RecentPerformance";
import ResultDetail from "./pages/student/ResultDetail";
import ResultsPage from "./pages/student/ResultsPage";
import SeriesDetails from "./pages/student/SeriesDetails";
// import TestSeriesCardImageStyle1 from "./pages/Home1";


/* Protected Route Component */
const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/" />;

  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <>
     {/* ✅ TOASTER MUST BE HERE */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: "bold",
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        
      
        <Route path="/login" element={<><Login /></>} />
          {/* <Route path="/home" element={<><Navbar /><TestSeriesCardImageStyle1 /></>} /> */}
        <Route path="/register" element={<><Register /></>} />
        <Route path="/forgot-password" element={<><ForgotPassword /></>} />
        <Route path="/reset-password/:token" element={<><ResetPassword /></>} />

        {/* Admin Route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/test-series"
          element={
            <ProtectedRoute role="admin">
              <TestSeriesList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/test-series/create"
          element={
            <ProtectedRoute role="admin">
              <CreateTestSeries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/test-series/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <CreateTestSeries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tests/:seriesId"
          element={
            <ProtectedRoute role="admin">
              <ManageTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests"
          element={
            <ProtectedRoute role="admin">
              <ManageTests />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/questions/:testId"
          element={
            <ProtectedRoute role="admin">
              <ManageQuestions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/test/:testId"
          element={
            <ProtectedRoute role="admin">
              <QuestionsTablePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/enrollments"
          element={
            <ProtectedRoute role="admin">
              <Enrollment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-test"
          element={
            <ProtectedRoute role="admin">
              <CreateTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <Users />
            </ProtectedRoute>
          }
        />




        {/* Student Route */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/test-series"
          element={
            <ProtectedRoute role="student">
              <AllTestSeries />
            </ProtectedRoute>
          }
        />



        <Route
          path="/student/my-tests"
          element={
            <ProtectedRoute role="student">
              <MyTests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/performance"
          element={
            <ProtectedRoute role="student">
              <Performance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/recent-performance"
          element={
            <ProtectedRoute role="student">
              <RecentPerformance />
            </ProtectedRoute>
          }
        />


        <Route
          path="/student/purchase-history"
          element={
            <ProtectedRoute role="student">
              <PurchaseHistory />
            </ProtectedRoute>
          }
        />


        <Route
          path="/student/attempt/:testId"
          element={
            <ProtectedRoute role="student">
              <AttemptInstruction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/exam/:attemptId"
          element={
            <ProtectedRoute role="student">
              <ExamWindow />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/results"
          element={
            <ProtectedRoute role="student">
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/result/:attemptId"
          element={
            <ProtectedRoute role="student">
              <ResultDetail />
            </ProtectedRoute>
          }
        />



        <Route
          path="/student/test-series/:id"
          element={<SeriesDetails />}
        />




        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
