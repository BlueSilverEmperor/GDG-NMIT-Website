"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Github, Linkedin, Mail, ChevronDown, Users } from "lucide-react";
import type { Member, TeamData, TierMembers, MemberTierGroup } from "@/types/team";

interface TeamProps {
  teamData: TeamData | null;
}

// Constants
const primaryColors = [
  "bg-[#4285F4]",
  "bg-[#EA4335]",
  "bg-[#FBBC04]",
  "bg-[#34A853]",
] as const;

const secondaryColors = [
  "bg-[#669DF6]",
  "bg-[#F28B82]",
  "bg-[#FDD663]",
  "bg-[#81C995]",
] as const;

const maskPaths = [
  "M20 2H380C389.941 2 398 10.0589 398 20V380C398 389.941 389.941 398 380 398H20C10.0589 398 2 389.941 2 380V20C2 10.0589 10.0589 2 20 2Z",
  "M20 2H380C389.941 2.00002 398 10.0589 398 20V380C398 389.941 389.941 398 380 398H150.512C140.571 398 132.512 389.941 132.512 380V333.924C132.512 321.774 122.662 311.924 110.512 311.924H20C10.0589 311.924 2 303.865 2 293.924V20C2.00001 10.0589 10.0589 2 20 2Z",
  "M20 2H380C389.941 2 398 10.0589 398 20V380C398 389.941 389.941 398 380 398H20C10.0589 398 2 389.941 2 380V290.524C2 280.583 10.0589 272.524 20 272.524H47.3115C59.4617 272.524 69.3115 262.675 69.3115 250.524V173.346C69.3115 161.195 59.4617 151.346 47.3115 151.346H20C10.059 151.346 2.00017 143.287 2 133.346V20C2.00001 10.0589 10.0589 2 20 2Z",
  "M20 2H380C389.941 2 398 10.0589 398 20V168.8C398 178.741 389.941 186.8 380 186.8H356.06C343.909 186.8 334.06 196.65 334.06 208.8V212.32C334.06 224.47 343.909 234.32 356.06 234.32H380C389.941 234.32 398 242.379 398 252.32V380C398 389.941 389.941 398 380 398H20C10.0589 398 2 389.941 2 380V20C2 10.0589 10.0589 2 20 2Z",
  "M20 2H380C389.941 2 398 10.0589 398 20V140.181C398 150.122 389.941 158.181 380 158.181H336.63C324.48 158.181 314.63 168.031 314.63 180.181V249.684C314.63 261.834 324.48 271.684 336.63 271.684H380C389.941 271.684 398 279.742 398 289.684V380C398 389.941 389.941 398 380 398H20C10.0589 398 2 389.941 2 380V332.217C2.00023 322.276 10.059 314.217 20 314.217H68.6914C80.8417 314.217 90.6914 304.367 90.6914 292.217V265.249C90.6914 253.099 80.8417 243.249 68.6914 243.249H20C10.0589 243.249 2.00008 235.19 2 225.249V20C2 10.0589 10.0589 2 20 2Z",
  "M20 2H380C389.941 2.00001 398 10.0589 398 20V380C398 389.941 389.941 398 380 398H167.583C157.642 398 149.583 389.941 149.583 380V363.564C149.583 351.414 139.733 341.565 127.583 341.564H72.9258C60.7757 341.565 50.9258 351.414 50.9258 363.564V380C50.9258 389.941 42.8669 398 32.9258 398H20C10.0589 398 2 389.941 2 380V20C2 10.0589 10.0589 2 20 2Z",
  "M2 380L2 20C2 10.0589 10.0589 2 20 2H380C389.941 2 398 10.0589 398 20V296.5C398 306.441 389.941 314.5 380 314.5H254.5C242.35 314.5 232.5 324.35 232.5 336.5V380C232.5 389.941 224.441 398 214.5 398H20C10.0589 398 2 389.941 2 380Z",
] as const;

interface MaskData {
  mask: string;
  strokePath: string;
}

const masks: MaskData[] = maskPaths.map((pathData) => {
  const maskSvg = `<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" fill="black" stroke="black" stroke-width="4"/></svg>`;
  return {
    mask: `data:image/svg+xml;base64,${btoa(maskSvg)}`,
    strokePath: pathData,
  };
});

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

// Helper Functions
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

// Main Component
const Team: React.FC<TeamProps> = ({ teamData }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
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

      Object.entries(tiers).forEach(([_tierName, tierMembers]) => {
        const extractedMembers = extractMembersFromTier(tierMembers);
        domainMembers.push(...extractedMembers);
      });

      grouped[domain] = sortMembersByTierRank(domainMembers);
    });

    return grouped;
  }, [teamData]);

  // Randomize tile shapes per session/page refresh
  const memberMasks = useMemo(() => {
    const map: Record<string, number> = {};
    if (!teamData?.members) return map;

    Object.values(teamData.members).forEach((tiers) => {
      Object.values(tiers).forEach((tierMembers) => {
        const extracted = extractMembersFromTier(tierMembers);
        extracted.forEach((m) => {
          const id = typeof m._id === "string" ? m._id : String(m._id);
          map[id] = Math.floor(Math.random() * masks.length);
        });
      });
    });

    return map;
  }, [teamData]);

  if (!teamData) {
    return (
      <div className="min-h-screen bg-white dark:bg-g-almost-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No team data available</p>
      </div>
    );
  }

  const activeDomains = Object.keys(groupedMembers);
  const domainsToRender =
    selectedDomain === "all"
      ? activeDomains
      : activeDomains.filter((d) => d === selectedDomain);

  const renderMemberCard = (member: Member, index: number) => {
    const colorIndex = index % 4;
    const maskIndex = memberMasks[member._id] ?? (index % masks.length);

    return (
      <div
        key={member._id}
        onClick={() =>
          setActiveMemberId((prev) =>
            prev === member._id ? null : member._id
          )
        }
        className="group relative w-full max-w-[80%] sm:max-w-[220px] mx-auto select-none z-10 hover:z-30 transition-all cursor-pointer"
      >
        {member.photoUrl && (
          <div className="mb-4 relative">
            {/* Right Social Sidebar Dock (covering full photo tile height) */}
            <div
              className={`absolute -right-12 inset-y-0 h-full w-12 z-30 flex flex-col justify-evenly items-center py-2 px-1 rounded-3xl bg-[#0c0e14] border border-white/20 shadow-2xl transition-all duration-300 ease-out ${
                activeMemberId === member._id
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : "opacity-0 -translate-x-3 pointer-events-none"
              } group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto hover:opacity-100 hover:pointer-events-auto hover:translate-x-0 before:absolute before:-left-8 before:inset-y-0 before:w-12 before:content-['']`}
            >
              {/* GitHub */}
              <a
                href={member.githubUrl || "https://github.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s GitHub`}
                title="GitHub Profile"
                className="relative z-10 w-9 h-9 rounded-2xl bg-neutral-800/80 hover:bg-black text-white flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 border border-white/5 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </a>

              {/* LinkedIn */}
              <a
                href={member.linkedinUrl || "https://linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s LinkedIn`}
                title="LinkedIn Profile"
                className="relative z-10 w-9 h-9 rounded-2xl bg-neutral-800/80 hover:bg-[#0077b5] text-white flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 border border-white/5 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="w-4 h-4" />
              </a>

              {/* X / Twitter */}
              <a
                href={member.twitterUrl || "https://x.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s X profile`}
                title="X (Twitter) Profile"
                className="relative z-10 w-9 h-9 rounded-2xl bg-neutral-800/80 hover:bg-black text-white flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 border border-white/5 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:${member.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`}
                aria-label={`Email ${member.name}`}
                title="Send Email"
                className="relative z-10 w-9 h-9 rounded-2xl bg-neutral-800/80 hover:bg-[#EA4335] text-white flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 border border-white/5 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <div className="relative w-full aspect-square">
              <div
                className={`relative w-full aspect-square ${primaryColors[colorIndex]} transition-all duration-300 group-hover:scale-[1.02]`}
                style={{
                  WebkitMaskImage: `url(${masks[maskIndex].mask})`,
                  maskImage: `url(${masks[maskIndex].mask})`,
                  WebkitMaskSize: "100%",
                  maskSize: "100%",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              >
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 220px"
                  className="object-cover md:grayscale-[90%] md:group-hover:grayscale-0 transition-all duration-300"
                />
              </div>

              <svg
                className="absolute inset-0 w-full h-full text-black dark:text-white pointer-events-none z-10"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d={masks[maskIndex].strokePath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Top Pill: Role */}
        <div
          className={`z-5 w-full ${primaryColors[colorIndex]} rounded-full border-3 border-black dark:border-white py-2 px-4 shadow-sm`}
        >
          <p className="text-center text-sm font-semibold text-black truncate">
            {member.role}
          </p>
        </div>

        {/* Bottom Pill: Name */}
        <div
          className={`transform -translate-y-[2px] w-full ${secondaryColors[colorIndex]} rounded-full border-3 border-black dark:border-white py-3 px-4 shadow-sm`}
        >
          <p className="text-center text-base sm:text-lg font-bold text-black truncate">
            {member.name}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-g-almost-black pt-16">
      <div className="pt-12 px-6 max-w-7xl mx-auto pb-16">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white capitalize">
            Meet Our Team Members
          </h2>
        </div>

        {/* Domain Filter Tabs */}
        {activeDomains.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {["all", ...activeDomains].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 border-black dark:border-white transition-all cursor-pointer ${
                  selectedDomain === d
                    ? "bg-[#4285F4] text-white shadow-md -translate-y-0.5"
                    : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                }`}
              >
                {d === "all" ? "All Domains" : domainNames[d] ?? d}
              </button>
            ))}
          </div>
        )}

        {domainsToRender.map((domain) => {
          const domainMembers = groupedMembers[domain] || [];
          if (domainMembers.length === 0) {
            return null;
          }

          const { coreMembers, otherMembers } = getDomainMemberSplit(domain, domainMembers);
          const isExpanded = !!expandedDomains[domain];

          return (
            <div key={domain} className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 capitalize">
                    {domainNames[domain] ?? domain}
                  </h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-2"></div>
                </div>

                {/* Per-Domain Dropdown Button */}
                {otherMembers.length > 0 && (
                  <button
                    onClick={() => toggleDomainDropdown(domain)}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-700 shadow-sm transition-all duration-200 cursor-pointer self-start sm:self-auto"
                    aria-expanded={isExpanded}
                  >
                    <Users className="w-4 h-4 text-[#4285F4]" />
                    <span>
                      {isExpanded
                        ? "Hide Team Members"
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

              {/* Core Team Grid (Always Visible) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {coreMembers.map((member, index) => renderMemberCard(member, index))}
              </div>

              {/* Team Members Dropdown Content */}
              {otherMembers.length > 0 && isExpanded && (
                <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-200 dark:border-neutral-800 transition-all duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-gray-600 dark:text-gray-300">
                        {domainNames[domain] ?? domain} &bull; Team Members ({otherMembers.length})
                      </h4>
                    </div>
                    <button
                      onClick={() => toggleDomainDropdown(domain)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      <span>Collapse</span>
                      <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                    {otherMembers.map((member, index) =>
                      renderMemberCard(member, coreMembers.length + index)
                    )}
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