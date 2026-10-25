"use client";
import React, { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { Github, Linkedin, Mail, ChevronDown, Eye, SlidersHorizontal, Sparkles, Globe } from "lucide-react";
import type { Member, TeamData, TierMembers, MemberTierGroup } from "@/types/team";

interface TeamProps {
  teamData: TeamData | null;
}

// -------------------------------------------------------------
// Google Developer Groups Color Palettes & Tokens
// -------------------------------------------------------------
interface Palette {
  id: string;
  name: string;
  primaryBg: string;
  secondaryBg: string;
  borderColor: string;
  accentBg: string;
  dotColor: string;
  glowColor: string;
  sectorFill: string;
  sectorHover: string;
  hex: string;
  badgeBg: string;
}

const colorPalettes: Record<string, Palette> = {
  blue: {
    id: "blue",
    name: "Blue",
    primaryBg: "bg-[#4285F4]",
    secondaryBg: "bg-[#7BAAF7]",
    borderColor: "border-[#4285F4]",
    accentBg: "bg-[#4285F4]",
    dotColor: "bg-[#4285F4]",
    glowColor: "rgba(66, 133, 244, 0.45)",
    sectorFill: "#4285F4",
    sectorHover: "#FF6600",
    hex: "#4285F4",
    badgeBg: "bg-[#4285F4]/15",
  },
  coral: {
    id: "coral",
    name: "Coral",
    primaryBg: "bg-[#EA4335]",
    secondaryBg: "bg-[#F28B82]",
    borderColor: "border-[#EA4335]",
    accentBg: "bg-[#EA4335]",
    dotColor: "bg-[#EA4335]",
    glowColor: "rgba(234, 67, 53, 0.45)",
    sectorFill: "#EA4335",
    sectorHover: "#FF6600",
    hex: "#EA4335",
    badgeBg: "bg-[#EA4335]/15",
  },
  yellow: {
    id: "yellow",
    name: "Yellow",
    primaryBg: "bg-[#FBBC04]",
    secondaryBg: "bg-[#FDD663]",
    borderColor: "border-[#FBBC04]",
    accentBg: "bg-[#FBBC04]",
    dotColor: "bg-[#FBBC04]",
    glowColor: "rgba(251, 188, 4, 0.45)",
    sectorFill: "#FBBC04",
    sectorHover: "#FF6600",
    hex: "#FBBC04",
    badgeBg: "bg-[#FBBC04]/15",
  },
  green: {
    id: "green",
    name: "Green",
    primaryBg: "bg-[#34A853]",
    secondaryBg: "bg-[#81C995]",
    borderColor: "border-[#34A853]",
    accentBg: "bg-[#34A853]",
    dotColor: "bg-[#34A853]",
    glowColor: "rgba(52, 168, 83, 0.45)",
    sectorFill: "#34A853",
    sectorHover: "#FF6600",
    hex: "#34A853",
    badgeBg: "bg-[#34A853]/15",
  },
};

const paletteKeys = ["blue", "coral", "yellow", "green"] as const;

// -------------------------------------------------------------
// Domain & Tier Ranking Helpers
// -------------------------------------------------------------
const tierRank: Record<string, number> = {
  "faculty coordinator": 12,
  lead: 11,
  "co-lead": 10,
  "student-advisor": 9,
  mentor: 8,
  core: 7,
  tech: 6,
  "pr & marketing": 5,
  operations: 4,
  design: 3,
  "social media": 2,
  "content and documentation": 1,
  member: -2,
  past: -3,
  recruit: -4,
};

const domainNames: Record<string, string> = {
  club: "Heads & Advisors",
  tech: "Technical Team",
  design: "Design Team",
  "content and documentation": "Content & Documentation",
  "pr & marketing": "PR & Marketing",
  "social media": "Social Media",
  operations: "Operations",
};

function isMemberArray(value: TierMembers): value is Member[] {
  return Array.isArray(value);
}

function isMemberTierGroup(value: TierMembers): value is MemberTierGroup {
  return !Array.isArray(value) && typeof value === "object" && value !== null;
}

function extractMembersFromTier(tierMembers: TierMembers): Member[] {
  if (isMemberArray(tierMembers)) {
    return tierMembers;
  }
  if (isMemberTierGroup(tierMembers)) {
    const members: Member[] = [];
    if (tierMembers.past) {
      members.push(...tierMembers.past);
    }
    if (tierMembers.recruit) {
      members.push(...tierMembers.recruit);
    }
    return members;
  }
  return [];
}

function sortMembersByTierRank(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const rankA = tierRank[a.tier] ?? 0;
    const rankB = tierRank[b.tier] ?? 0;
    if (rankB !== rankA) {
      return rankB - rankA;
    }
    return a.name.localeCompare(b.name);
  });
}

function getDomainMemberSplit(domain: string, members: Member[]): {
  coreMembers: Member[];
  otherMembers: Member[];
} {
  if (domain === "club") {
    return { coreMembers: members, otherMembers: [] };
  }

  const explicitOther = members.filter((m) => {
    const t = m.tier?.toLowerCase()?.trim();
    return t === "member" || t === "recruit" || t === "past";
  });

  if (explicitOther.length > 0) {
    const explicitCore = members.filter((m) => {
      const t = m.tier?.toLowerCase()?.trim();
      return t !== "member" && t !== "recruit" && t !== "past";
    });
    return {
      coreMembers: explicitCore.length > 0 ? explicitCore : members.slice(0, 4),
      otherMembers: explicitCore.length > 0 ? explicitOther : members.slice(4),
    };
  }

  if (members.length > 4) {
    return {
      coreMembers: members.slice(0, 4),
      otherMembers: members.slice(4),
    };
  }

  return {
    coreMembers: members,
    otherMembers: [],
  };
}

// -------------------------------------------------------------
// Polar & Annular Radial Geometry Generator
// -------------------------------------------------------------
function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number) {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
}

function describeAnnularSector(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// -------------------------------------------------------------
// Authentic GDG Illustrated Avatar Pic Frame
// (Top-left blue globe tab + semicolon, right stacked beads,
//  bottom-right pastel wave, and GDG chevron logo badge)
// -------------------------------------------------------------
interface GDGAvatarPicFrameProps {
  photoUrl: string;
  name: string;
  githubUrl?: string;
  className?: string;
}

const GDGAvatarPicFrame: React.FC<GDGAvatarPicFrameProps> = ({
  photoUrl,
  name,
  githubUrl,
  className = "",
}) => {
  return (
    <div className={`relative w-[210px] h-[210px] sm:w-[220px] sm:h-[220px] select-none ${className}`}>
      {/* Base Circular Photo Container with Solid Black Border */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-[3.5px] border-black bg-neutral-900 shadow-xl">
        <Image
          src={photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500"}
          alt={name}
          fill
          sizes="240px"
          className="object-cover object-center transition-transform duration-500 group-hover/tilt:scale-105"
        />

        {/* ---------------- OVERLAY GRAPHICS CLIPPED INSIDE CIRCLE ---------------- */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          viewBox="0 0 240 240"
        >
          {/* 1. Top-Left Blue Graphic Tab */}
          <path
            d="M 6 86 A 118 118 0 0 1 76 8 C 76 28, 68 56, 50 68 C 32 80, 16 82, 6 86 Z"
            fill="#4BB3FD"
            stroke="#000000"
            strokeWidth="2.5"
          />

          {/* 2. Semicolon Punctuation Mark at neck of Blue Tab */}
          {/* Top cyan circle */}
          <circle cx="84" cy="24" r="7.5" fill="#D2F3FE" stroke="#000000" strokeWidth="2.2" />
          {/* Bottom black curved comma */}
          <path
            d="M 84 34 C 88 34, 91 38, 89 43 C 87 49, 81 57, 78 60 C 79 54, 82 48, 82 44 C 81 42, 81 36, 84 34 Z"
            fill="#000000"
          />

          {/* 3. Right Stacked Blue Beads */}
          <circle cx="212" cy="106" r="11" fill="#4285F4" stroke="#000000" strokeWidth="2.5" />
          <circle cx="212" cy="128" r="11" fill="#3B78E7" stroke="#000000" strokeWidth="2.5" />

          {/* 4. Bottom-Right Pastel Cyan Wave */}
          <path
            d="M 218 138 A 118 118 0 0 1 150 220 C 160 200, 180 185, 188 165 C 196 150, 208 142, 218 138 Z"
            fill="#D4F4FD"
            stroke="#000000"
            strokeWidth="2.5"
          />
        </svg>

        {/* Top-Left Globe Line-Art Icon inside Blue Tab */}
        <div
          title="Developer Profile"
          className="absolute top-7 left-6 z-20 pointer-events-auto cursor-pointer transition-transform duration-200 hover:scale-115 text-black"
          onClick={(e) => {
            e.stopPropagation();
            if (githubUrl) window.open(githubUrl, "_blank", "noopener,noreferrer");
          }}
        >
          <Globe className="w-5 h-5 text-black stroke-[2.2]" />
        </div>
      </div>

      {/* 5. Google Developer Logo Emblem Badge (Floating at bottom-right) */}
      <div
        style={{ transform: "translateZ(48px)" }}
        className="absolute bottom-3 right-2 z-30 bg-[#F8F9FA] border-[2.5px] border-black rounded-full px-3 py-1.5 shadow-[2px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center transform rotate-[-4deg] hover:rotate-0 hover:scale-105 transition-all duration-200 pointer-events-none select-none"
      >
        <svg width="34" height="20" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Bracket < (Google Blue base + Red cap) */}
          <path
            d="M11 3.5L3.5 10L11 16.5"
            stroke="#4285F4"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M11 3.5L7.5 6.5" stroke="#EA4335" strokeWidth="4.5" strokeLinecap="round" />

          {/* Right Bracket > (Google Green cap + Yellow base) */}
          <path
            d="M25 3.5L32.5 10L25 16.5"
            stroke="#34A853"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M28.5 13.5L25 16.5" stroke="#FBBC04" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Tilt Card with BeamNG 4-Quadrant Radial Menu & Avatar Frame
// -------------------------------------------------------------
interface TiltCardProps {
  member: Member;
  domain: string;
  palette: Palette;
  forceInspect: boolean;
}

const TiltCard: React.FC<TiltCardProps> = ({ member, domain, palette, forceInspect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glare, setGlare] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((mouseY - centerY) / centerY) * 12;
    const rotY = ((mouseX - centerX) / centerX) * 12;

    setTilt({ x: rotX, y: rotY });
    setGlare({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
    });
    setIsCardHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsCardHovered(false);
    setActiveQuadrant(null);
  };

  const isMenuOpen = forceInspect || isCardHovered;

  // BeamNG Quadrants Configuration
  const quadrants = [
    {
      id: "TL",
      label: "GITHUB",
      code: "QUADRANT_TL // GITHUB",
      startAngle: 205,
      endAngle: 265,
      iconCenterAngle: 235,
      iconRadius: 122,
      url: member.githubUrl || "https://github.com",
      Icon: Github,
    },
    {
      id: "TR",
      label: "LINKEDIN",
      code: "QUADRANT_TR // LINKEDIN",
      startAngle: 295,
      endAngle: 355,
      iconCenterAngle: 325,
      iconRadius: 122,
      url: member.linkedinUrl || "https://linkedin.com",
      Icon: Linkedin,
    },
    {
      id: "BR",
      label: "TWITTER",
      code: "QUADRANT_BR // TWITTER",
      startAngle: 25,
      endAngle: 85,
      iconCenterAngle: 55,
      iconRadius: 122,
      url: member.twitterUrl || "https://x.com",
      Icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: "BL",
      label: "EMAIL",
      code: "QUADRANT_BL // EMAIL",
      startAngle: 115,
      endAngle: 175,
      iconCenterAngle: 145,
      iconRadius: 122,
      url: `mailto:${member.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      Icon: Mail,
    },
  ];

  return (
    <div className="relative group/tilt w-full max-w-[340px] sm:max-w-[360px]">
      {/* Outer Offset Accent Frame Shell */}
      <div
        className={`absolute inset-0 rounded-[42px] transition-all duration-300 ${palette.accentBg} translate-x-2 translate-y-2 opacity-90 group-hover/tilt:translate-x-3 group-hover/tilt:translate-y-3 shadow-xl`}
      />

      {/* Main 3D Card Surface */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative z-10 w-full rounded-[38px] bg-[#0E1015] border-[3.5px] ${palette.borderColor} p-6 pb-7 flex flex-col items-center justify-between shadow-2xl transition-all select-none overflow-hidden`}
        style={{
          transformStyle: "preserve-3d",
          transform: isCardHovered
            ? `perspective(1000px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
          transition: isCardHovered
            ? "transform 0.08s ease-out"
            : "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Specular Dynamic Glare Overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[36px] transition-opacity duration-300"
          style={{
            opacity: isCardHovered ? 0.35 : 0,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)`,
            zIndex: 40,
          }}
        />

        {/* ---------------- CARD TOP BAR ---------------- */}
        <div
          style={{ transform: "translateZ(18px)" }}
          className="w-full flex items-center justify-between px-1 mb-2 pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${palette.dotColor} shadow-sm animate-pulse`}
            />
            <span className="text-[11px] font-black tracking-widest text-white uppercase font-sans">
              {domainNames[domain] ?? domain}
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-gray-400 font-semibold">
            GDG NMIT
          </span>
        </div>

        <div className="w-full h-[1px] bg-white/10 mb-4" />

        {/* ---------------- CENTER STAGE: AVATAR & RADIAL MENU ---------------- */}
        <div className="relative w-[270px] h-[270px] flex items-center justify-center my-1">
          {/* SVG 4-Quadrant BeamNG Radial Menu (surrounding the avatar) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
            viewBox="0 0 270 270"
          >
            <defs>
              <filter id={`glow-orange-${member._id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FF6600" floodOpacity="0.9" />
              </filter>
              <filter id={`glow-palette-${member._id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={palette.hex} floodOpacity="0.6" />
              </filter>
            </defs>

            {/* 4 Annular Radial Quadrants */}
            {quadrants.map((quad) => {
              const isQuadActive = activeQuadrant === quad.id;
              // Expand from inner avatar radius ~110 to outer radius ~138 on open/hover
              const rInner = 110;
              const rOuter = isMenuOpen ? (isQuadActive ? 140 : 134) : 111;
              const pathD = describeAnnularSector(135, 135, rInner, rOuter, quad.startAngle, quad.endAngle);

              return (
                <path
                  key={quad.id}
                  d={pathD}
                  fill={isQuadActive ? "#FF6600" : palette.sectorFill}
                  stroke="#000000"
                  strokeWidth="2.5"
                  className="transition-all duration-300 ease-out cursor-pointer pointer-events-auto"
                  filter={
                    isQuadActive
                      ? `url(#glow-orange-${member._id})`
                      : isMenuOpen
                      ? `url(#glow-palette-${member._id})`
                      : undefined
                  }
                  style={{
                    opacity: isMenuOpen ? (isQuadActive ? 1 : 0.88) : 0,
                    transform: isMenuOpen ? "scale(1)" : "scale(0.92)",
                    transformOrigin: "135px 135px",
                  }}
                  onMouseEnter={() => setActiveQuadrant(quad.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(quad.url, "_blank", "noopener,noreferrer");
                  }}
                />
              );
            })}
          </svg>

          {/* Quadrant Icon Nodes Layer */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="absolute inset-0 pointer-events-none z-25"
          >
            {quadrants.map((quad) => {
              const isQuadActive = activeQuadrant === quad.id;
              const coords = polarToCartesian(135, 135, quad.iconRadius, quad.iconCenterAngle);
              const IconComp = quad.Icon;

              return (
                <a
                  key={quad.id}
                  href={quad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on ${quad.label}`}
                  title={`${quad.label} Profile`}
                  style={{
                    left: `${coords.x}px`,
                    top: `${coords.y}px`,
                    opacity: isMenuOpen ? 1 : 0,
                    transform: `translate(-50%, -50%) scale(${isQuadActive ? 1.25 : 1})`,
                  }}
                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto cursor-pointer ${
                    isQuadActive
                      ? "text-white drop-shadow-[0_0_8px_rgba(255,102,0,1)]"
                      : "text-black"
                  }`}
                  onMouseEnter={() => setActiveQuadrant(quad.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconComp className="w-4 h-4" />
                </a>
              );
            })}
          </div>

          {/* Central Illustrated GDG Avatar Pic Frame (translateZ: 30px) */}
          <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
            <GDGAvatarPicFrame
              photoUrl={member.photoUrl}
              name={member.name}
              githubUrl={member.githubUrl}
            />
          </div>
        </div>

        {/* ---------------- STATUS / QUADRANT CODE TEXT ---------------- */}
        <div
          style={{ transform: "translateZ(20px)" }}
          className="w-full text-center my-3 min-h-[20px] flex items-center justify-center"
        >
          {activeQuadrant ? (
            <span className="text-[#FF6600] font-mono font-bold tracking-[0.2em] text-[11px] animate-pulse">
              {quadrants.find((q) => q.id === activeQuadrant)?.code}
            </span>
          ) : (
            <span className="text-[10px] font-mono tracking-[0.28em] text-gray-500 uppercase transition-opacity duration-300">
              {isMenuOpen ? "RADIAL MENU ACTIVE" : "HOVER TO EXPAND"}
            </span>
          )}
        </div>

        {/* ---------------- BOTTOM PILLS: ROLE & NAME ---------------- */}
        <div className="w-full flex flex-col items-center mt-1">
          {/* Top Pill: Role */}
          <div
            style={{ transform: "translateZ(32px)" }}
            className={`w-full ${palette.primaryBg} rounded-full border-[3px] border-white py-2.5 px-4 shadow-md flex items-center justify-center`}
          >
            <p className="text-center text-xs sm:text-sm font-black text-black uppercase tracking-wide truncate">
              {member.role}
            </p>
          </div>

          {/* Bottom Pill: Name */}
          <div
            style={{ transform: "translateZ(38px)" }}
            className={`w-full ${palette.secondaryBg} rounded-full border-[3px] border-white py-3 px-4 shadow-md flex items-center justify-center mt-2.5`}
          >
            <p className="text-center text-base sm:text-lg font-black text-black tracking-normal truncate">
              {member.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Main Team Component with Controls & Filters
// -------------------------------------------------------------
const Team: React.FC<TeamProps> = ({ teamData }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [forceInspect, setForceInspect] = useState<boolean>(false);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

  const toggleDomainDropdown = (domain: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  const groupedMembers = useMemo(() => {
    if (!teamData?.members) {
      return {};
    }

    const grouped: Record<string, Member[]> = {};

    Object.entries(teamData.members).forEach(([domain, tiers]) => {
      const domainMembers: Member[] = [];

      Object.values(tiers).forEach((tierMembers) => {
        const extractedMembers = extractMembersFromTier(tierMembers);
        domainMembers.push(...extractedMembers);
      });

      grouped[domain] = sortMembersByTierRank(domainMembers);
    });

    return grouped;
  }, [teamData]);

  if (!teamData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400 font-mono">No team data available</p>
      </div>
    );
  }

  const activeDomains = Object.keys(groupedMembers);
  const domainsToRender =
    selectedDomain === "all"
      ? activeDomains
      : activeDomains.filter((d) => d === selectedDomain);

  // Helper to resolve card palette (cycles or locks to selected color filter)
  const getCardPalette = (index: number): Palette => {
    if (selectedColor !== "all" && colorPalettes[selectedColor]) {
      return colorPalettes[selectedColor];
    }
    const key = paletteKeys[index % paletteKeys.length];
    return colorPalettes[key];
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-20 pb-28">
      <div className="px-6 max-w-7xl mx-auto">
        {/* Header Title Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span>Interactive 3D BeamNG Physics Showcase</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Meet Our Team
          </h1>
          <p className="mt-2 text-gray-400 text-sm sm:text-base max-w-2xl font-sans">
            Explore our leads, core team, and community contributors with 3D perspective tilt,
            dynamic glare, and 4-quadrant radial social nodes.
          </p>
        </div>

        {/* ---------------- CONTROL BAR & PALETTE FILTERS ---------------- */}
        <div className="mb-12 p-4 sm:p-5 rounded-3xl bg-[#101217] border border-white/10 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left: Inspect Radial Menus Force Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForceInspect(!forceInspect)}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border-2 ${
                forceInspect
                  ? "bg-[#FF6600] text-black border-[#FF6600] shadow-[0_0_16px_rgba(255,102,0,0.6)]"
                  : "bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:border-white/40"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Inspect Radial Menus: {forceInspect ? "ENABLED" : "OFF"}</span>
            </button>
            <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
              (Forces all 4-quadrant menus open)
            </span>
          </div>

          {/* Right: Color Palette Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Palette:</span>
            </div>

            <button
              onClick={() => setSelectedColor("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border cursor-pointer ${
                selectedColor === "all"
                  ? "bg-white text-black border-white shadow-md"
                  : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
              }`}
            >
              All Google
            </button>

            {paletteKeys.map((key) => {
              const pal = colorPalettes[key];
              const isSelected = selectedColor === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedColor(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? `${pal.primaryBg} text-black border-white shadow-[0_0_12px_${pal.glowColor}]`
                      : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${pal.dotColor}`} />
                  <span>{pal.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- DOMAIN FILTER PILLS ---------------- */}
        {activeDomains.length > 1 && (
          <div className="flex flex-wrap gap-2.5 mb-14">
            {["all", ...activeDomains].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold border-2 transition-all cursor-pointer ${
                  selectedDomain === d
                    ? "bg-[#4285F4] text-white border-white shadow-lg -translate-y-0.5"
                    : "bg-[#12141A] text-gray-400 border-white/10 hover:text-white hover:border-white/30"
                }`}
              >
                {d === "all" ? "All Domains" : domainNames[d] ?? d}
              </button>
            ))}
          </div>
        )}

        {/* ---------------- DOMAINS & CARDS LIST ---------------- */}
        {domainsToRender.map((domain) => {
          const domainMembers = groupedMembers[domain] || [];
          if (domainMembers.length === 0) return null;

          const { coreMembers, otherMembers } = getDomainMemberSplit(domain, domainMembers);
          const isExpanded = !!expandedDomains[domain];

          return (
            <div key={domain} className="mb-20">
              {/* Domain Header & Dropdown Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white capitalize">
                    {domainNames[domain] ?? domain}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] rounded-full mt-2.5" />
                </div>

                {/* Extended Members Dropdown Button */}
                {otherMembers.length > 0 && (
                  <button
                    onClick={() => toggleDomainDropdown(domain)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold bg-[#14161E] border-2 border-white/20 text-gray-200 hover:border-white hover:text-white transition-all cursor-pointer shadow-md"
                  >
                    <span>
                      {isExpanded
                        ? `Hide Team Members (${otherMembers.length})`
                        : `View Team Members (${otherMembers.length})`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Core Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center">
                {coreMembers.map((member, index) => (
                  <TiltCard
                    key={member._id}
                    member={member}
                    domain={domain}
                    palette={getCardPalette(index)}
                    forceInspect={forceInspect}
                  />
                ))}
              </div>

              {/* Extended Members Dropdown Content */}
              {otherMembers.length > 0 && isExpanded && (
                <div className="mt-14 pt-8 border-t-2 border-dashed border-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-ping" />
                      <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-300">
                        {domainNames[domain] ?? domain} &bull; Extended Team ({otherMembers.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleDomainDropdown(domain)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 hover:text-white cursor-pointer"
                    >
                      <span>Collapse</span>
                      <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center">
                    {otherMembers.map((member, index) => (
                      <TiltCard
                        key={member._id}
                        member={member}
                        domain={domain}
                        palette={getCardPalette(coreMembers.length + index)}
                        forceInspect={forceInspect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Team;
