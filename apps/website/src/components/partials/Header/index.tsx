import { fetchCategoriesTree } from "@/services/category.service";
import Navigation from "./Navigation";
import TopHeader from "./TopHeader";

const Header = async () => {
  const { data } = await fetchCategoriesTree({
    page: 1,
    limit: 20,
    sort: "sequence",
  });
  return (
    <>
      <TopHeader categories={data || []} />
      <Navigation categories={data || []} />
    </>
  );
};

export default Header;
