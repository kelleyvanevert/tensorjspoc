import { Integration } from "./components/Integration";
import { RoomDemoApp } from "./components/RoomDemoApp";

export default function App() {
  return (
    <div className="m-8 flex gap-8">
      {/* <div className="w-1/2 bg-gray-200 min-h-screen">
        <Integration />
      </div> */}
      <div className="w-1/2 bg-gray-200 min-h-screen">
        <RoomDemoApp />
      </div>
    </div>
  );
}
