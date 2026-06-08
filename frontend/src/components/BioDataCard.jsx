import {
  User, MapPin, Briefcase, GraduationCap, Heart,
  Phone, Mail, Calendar, Ruler, IndianRupee,
  Languages, Users, Utensils, Wine, Cigarette,
  Home, BookOpen,
} from "lucide-react";

/**
 * BioDataCard — Displays full customer biodata in organized sections.
 */

function InfoRow({ icon: Icon, label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
        {children}
      </div>
    </div>
  );
}

export default function BioDataCard({ customer }) {
  if (!customer) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
              customer.gender === "Male"
                ? "bg-blue-100 text-blue-700"
                : "bg-pink-100 text-pink-700"
            }`}
          >
            {customer.firstName[0]}{customer.lastName[0]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {customer.firstName} {customer.lastName}
            </h3>
            <p className="text-sm text-slate-500">
              {customer.age} years · {customer.gender} · {customer.city}
            </p>
          </div>
        </div>
        {customer.aboutMe && (
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {customer.aboutMe}
          </p>
        )}
      </div>

      {/* Bio data sections */}
      <div className="px-6 py-5 space-y-6">
        {/* Personal */}
        <Section title="Personal Information">
          <InfoRow icon={User} label="Full Name" value={`${customer.firstName} ${customer.lastName}`} />
          <InfoRow icon={Calendar} label="Date of Birth" value={customer.dateOfBirth} />
          <InfoRow icon={User} label="Gender" value={customer.gender} />
          <InfoRow icon={Ruler} label="Height" value={`${customer.height} cm`} />
          <InfoRow icon={MapPin} label="City" value={customer.city} />
          <InfoRow icon={MapPin} label="Country" value={customer.country} />
        </Section>

        <hr className="border-slate-100" />

        {/* Contact */}
        <Section title="Contact">
          <InfoRow icon={Mail} label="Email" value={customer.email} />
          <InfoRow icon={Phone} label="Phone" value={customer.phone} />
        </Section>

        <hr className="border-slate-100" />

        {/* Education & Career */}
        <Section title="Education & Career">
          <InfoRow icon={GraduationCap} label="Degree" value={customer.degree} />
          <InfoRow icon={BookOpen} label="College" value={customer.ugCollege} />
          <InfoRow icon={Briefcase} label="Company" value={customer.currentCompany} />
          <InfoRow icon={Briefcase} label="Designation" value={customer.designation} />
          <InfoRow icon={IndianRupee} label="Income" value={customer.incomeFormatted} />
        </Section>

        <hr className="border-slate-100" />

        {/* Family & Background */}
        <Section title="Family & Background">
          <InfoRow icon={Heart} label="Marital Status" value={customer.maritalStatus} />
          <InfoRow icon={Heart} label="Religion" value={customer.religion} />
          <InfoRow icon={Heart} label="Caste" value={customer.caste} />
          <InfoRow icon={Languages} label="Mother Tongue" value={customer.motherTongue} />
          <InfoRow icon={Languages} label="Languages Known" value={customer.languagesKnown?.join(", ")} />
          <InfoRow icon={Users} label="Siblings" value={customer.siblings} />
          <InfoRow icon={Home} label="Family Type" value={customer.familyType} />
          <InfoRow icon={Briefcase} label="Father's Occupation" value={customer.fatherOccupation} />
          <InfoRow icon={Briefcase} label="Mother's Occupation" value={customer.motherOccupation} />
          <InfoRow icon={IndianRupee} label="Family Income" value={customer.familyIncome} />
          <InfoRow icon={Heart} label="Gotra" value={customer.gotra} />
          <InfoRow icon={Heart} label="Manglik Status" value={customer.manglikStatus} />
        </Section>

        <hr className="border-slate-100" />

        {/* Lifestyle & Preferences */}
        <Section title="Lifestyle & Preferences">
          <InfoRow icon={Utensils} label="Diet" value={customer.diet} />
          <InfoRow icon={Wine} label="Drinking" value={customer.drinking} />
          <InfoRow icon={Cigarette} label="Smoking" value={customer.smoking} />
          <InfoRow icon={Users} label="Want Kids" value={customer.wantKids} />
          <InfoRow icon={MapPin} label="Open to Relocate" value={customer.openToRelocate} />
          <InfoRow icon={Heart} label="Open to Pets" value={customer.openToPets} />
        </Section>
      </div>
    </div>
  );
}
