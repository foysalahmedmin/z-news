import { RouterProvider } from "react-router";
import useAppRouter from "./hooks/states/useRouter";

const App = () => {
  const router = useAppRouter();
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
