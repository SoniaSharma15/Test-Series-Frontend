
import loaderImg from "../../assets/loader.png"

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="relative flex items-center justify-center">
        <div className="h-30 w-30 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />

        <img
          src={loaderImg}
          alt="Loading"
          className="absolute h-16 w-16 animate-pulse"
        />
      </div>
    </div>
  );
}

export default Loader;
