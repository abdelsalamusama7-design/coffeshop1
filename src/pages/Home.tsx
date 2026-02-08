import { useState } from "react";
import { Coffee, Snowflake, GlassWater, Droplets, CupSoda, Package } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import CategoryProducts from "@/components/home/CategoryProducts";

const categories = [
  { id: "مشروبات ساخنة", name: "مشروبات ساخنة", icon: Coffee, color: "bg-amber-500", emoji: "☕" },
  { id: "مشروبات باردة", name: "مشروبات باردة", icon: Snowflake, color: "bg-blue-500", emoji: "🧊" },
  { id: "مياه غازية", name: "مياه غازية", icon: CupSoda, color: "bg-red-500", emoji: "🥤" },
  { id: "مياه معدنية", name: "مياه معدنية", icon: Droplets, color: "bg-cyan-500", emoji: "💧" },
  { id: "عصائر", name: "عصائر", icon: GlassWater, color: "bg-orange-500", emoji: "🍹" },
  { id: "أخرى", name: "أخرى", icon: Package, color: "bg-gray-500", emoji: "📦" },
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (selectedCategory) {
    return (
      <MainLayout title={selectedCategory}>
        <CategoryProducts
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="الصفحة الرئيسية" subtitle="اختر القسم للبدء">
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          اختر القسم
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${category.color} hover:opacity-90 transition-all duration-200 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
            >
              <span className="text-4xl md:text-5xl">{category.emoji}</span>
              <span className="text-lg md:text-xl font-bold text-center">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
