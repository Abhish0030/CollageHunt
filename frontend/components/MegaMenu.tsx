"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Scale,
  Stethoscope,
} from "lucide-react";
import {
  megaMenuCategories,
  type MegaMenuCategory,
  type MegaMenuIcon,
  type MegaMenuLink,
} from "@/data/megaMenuData";

const iconMap: Record<MegaMenuIcon, typeof GraduationCap> = {
  GraduationCap,
  Stethoscope,
  Scale,
  Briefcase,
  Building2,
  BookOpen,
};

const getFirstSectionLabel = (category: MegaMenuCategory | null) => category?.sections[0]?.label ?? "";

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const closeTimer = useRef<NodeJS.Timeout>();

  const currentCategory =
    megaMenuCategories.find((category) => category.key === activeCategory) ?? null;
  const currentSection =
    currentCategory?.sections.find((section) => section.label === activeSection) ??
    currentCategory?.sections[0] ??
    null;
  const isSchoolCategory = currentCategory?.key === "school";

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  };

  const closeMenu = () => {
    clearCloseTimer();
    setActiveCategory(null);
    setActiveSection("");
  };

  const openCategory = (category: MegaMenuCategory) => {
    clearCloseTimer();
    setActiveCategory(category.key);
    setActiveSection(getFirstSectionLabel(category));
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setActiveCategory(null);
      setActiveSection("");
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  return (
    <div
      className="sticky top-16 z-40 hidden md:block"
      onMouseLeave={scheduleClose}
    >
      <div className="relative overflow-visible">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-[1280px] items-center gap-1 overflow-x-auto px-6">
            {megaMenuCategories.map((category) => {
              const Icon = iconMap[category.icon];
              const isActive = activeCategory === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-[14px] text-sm transition-colors lg:px-5 ${
                    isActive
                      ? "border-orange-500 font-semibold text-gray-900"
                      : "border-transparent font-medium text-gray-600 hover:border-orange-500 hover:text-gray-900"
                  }`}
                  onMouseEnter={() => openCategory(category)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{category.label}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {currentCategory && currentSection ? (
          <div
            className="absolute left-0 top-full z-50 flex w-screen border-t border-gray-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
            onMouseEnter={clearCloseTimer}
          >
            <div className="mx-auto flex w-full max-w-[1280px]">
              <div className="w-[240px] min-w-[240px] border-r border-gray-100 py-2">
                {currentCategory.sections.map((section) => {
                  const isSectionActive = section.label === currentSection.label;

                  return (
                    <div
                      key={section.label}
                      className={`flex cursor-pointer items-center justify-between px-5 py-2.5 text-sm ${
                        isSectionActive
                          ? "border-l-[3px] border-orange-500 bg-gray-50 font-semibold text-gray-900"
                          : "border-l-[3px] border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onMouseEnter={() => setActiveSection(section.label)}
                    >
                      <div className="flex items-center">
                        <span>{section.label}</span>
                        {section.isNew ? (
                          <span className="ml-2 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        ) : null}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 px-6 py-4 lg:px-8">
                <div
                  className={
                    isSchoolCategory
                      ? "max-w-[760px] columns-2 gap-x-16"
                      : "max-w-[720px]"
                  }
                >
                  {currentSection.links.map((link: MegaMenuLink) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm leading-6 text-gray-700 transition-colors hover:text-orange-500 hover:underline ${
                        isSchoolCategory ? "mb-2 block break-inside-avoid py-[3px]" : "block py-[7px]"
                      }`}
                      onClick={closeMenu}
                    >
                      <span>{link.label}</span>
                      {link.isNew ? (
                        <span className="ml-2 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
