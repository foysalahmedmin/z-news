import Icon from "@/components/ui/Icon";
import { SOCIALS } from "@/config";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="dark bg-background text-foreground">
      <div className="container">
        <div className="py-6 md:py-10">
          {/* Top Section */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Logo & About */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Z-News</h2>
                <p className="text-muted-foreground mt-3 text-sm">
                  আপনার বিশ্বস্ত সংবাদ মাধ্যম — সর্বশেষ সংবাদ, নিরপেক্ষ বিশ্লেষণ
                  এবং সঠিক তথ্য সরবরাহে অঙ্গীকারবদ্ধ।
                </p>
              </div>
              <div className="flex flex-wrap space-x-4">
                {SOCIALS.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name={social.name} className="size-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">প্রয়োজনীয় লিঙ্ক</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/">প্রথম পাতা</a>
                </li>
                <li>
                  <a href="/about">আমাদের সম্পর্কে</a>
                </li>
                <li>
                  <a href="/contact">যোগাযোগ</a>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">যোগাযোগ</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  ইমেইল:{" "}
                  <a className="text-foreground" href="news@z-news.com">
                    news@z-news.com
                  </a>
                </p>
                <p className="text-muted-foreground text-sm">
                  মোবাইল:{" "}
                  <a className="text-foreground" href="tel:+8801893044041">
                    +880 1893-044041
                  </a>
                </p>
                <p className="text-muted-foreground text-sm">
                  ঠিকানা:{" "}
                  <a
                    className="text-foreground"
                    href="https://www.google.com/maps?q=ভিশন+২০২১+টাওয়ার,+সফটওয়্যার+টেকনোলজি+পার্ক,১০ম+তলা,+কারওয়ান+বাজার,+ঢাকা-১২১৫"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ভিশন ২০২১ টাওয়ার, সফটওয়্যার টেকনোলজি পার্ক, ১০ম তলা, কারওয়ান
                    বাজার, ঢাকা-১২১৫
                  </a>
                </p>
              </div>
            </div>
          </div>

          <hr className="my-6 md:my-10" />

          {/* Bottom Section */}
          <div className="text-muted-foreground flex flex-col items-center justify-between text-sm sm:flex-row">
            <p>প্রকাশক ও সম্পাদক: তৌহিদ হোসেন</p>
            <p>
              © {new Date().getFullYear()} Z-News — সর্বস্বত্ব সংরক্ষিত
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
