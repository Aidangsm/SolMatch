import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hash = await bcrypt.hash("Password1", 12);

  // Demo homeowner
  const homeowner = await prisma.user.upsert({
    where: { email: "demo@solmatch.co.za" },
    update: {},
    create: {
      email: "demo@solmatch.co.za",
      passwordHash: hash,
      firstName: "Aidan",
      lastName: "Demo",
      role: "HOMEOWNER",
      consentGiven: true,
      consentTimestamp: new Date(),
    },
  });

  // Demo installer users
  const installerData = [
    {
      email: "sunpower@solmatch.co.za",
      firstName: "SunPower",
      lastName: "Solar",
      company: {
        companyName: "SunPower Solar Solutions",
        registrationNo: "2019/123456/07",
        description: "Cape Town's leading residential solar installer with over 500 installations. SAPVIA certified team, 10-year workmanship warranty on all installs.",
        province: "Western Cape",
        city: "Cape Town",
        phone: "021 555 0101",
        email: "info@sunpowersolar.co.za",
        yearsExperience: 7,
        systemTypes: JSON.stringify(["residential","commercial","hybrid"]),
        certifications: JSON.stringify(["SAPVIA","SAQCC","PV GreenCard"]),
        verified: true,
        badgeActive: true,
        badgeExpiresAt: new Date("2027-01-01"),
        avgRating: 4.8,
        totalReviews: 47,
        minSystemSize: 3,
        maxSystemSize: 100,
        priceRangeMin: 55000,
        priceRangeMax: 280000,
      },
    },
    {
      email: "gauteng@solmatch.co.za",
      firstName: "Joburg",
      lastName: "Solar",
      company: {
        companyName: "Joburg Solar & Battery",
        registrationNo: "2020/987654/07",
        description: "Gauteng's trusted solar partner. We specialise in load-shedding solutions with battery backup, serving Johannesburg and Pretoria.",
        province: "Gauteng",
        city: "Johannesburg",
        phone: "011 555 0202",
        email: "info@joburgsolarbattery.co.za",
        yearsExperience: 5,
        systemTypes: JSON.stringify(["residential","hybrid","off-grid"]),
        certifications: JSON.stringify(["SAPVIA","PV GreenCard"]),
        verified: true,
        badgeActive: true,
        badgeExpiresAt: new Date("2027-01-01"),
        avgRating: 4.6,
        totalReviews: 33,
        minSystemSize: 5,
        maxSystemSize: 200,
        priceRangeMin: 80000,
        priceRangeMax: 500000,
      },
    },
    {
      email: "durban@solmatch.co.za",
      firstName: "Coastal",
      lastName: "Solar",
      company: {
        companyName: "Coastal Solar KZN",
        registrationNo: "2021/456789/07",
        description: "KwaZulu-Natal's solar experts. Coastal environments require special installation techniques — our team is trained and certified for corrosive conditions.",
        province: "KwaZulu-Natal",
        city: "Durban",
        phone: "031 555 0303",
        email: "info@coastalsolarkzn.co.za",
        yearsExperience: 4,
        systemTypes: JSON.stringify(["residential","commercial"]),
        certifications: JSON.stringify(["SAPVIA","SAQCC"]),
        verified: true,
        badgeActive: false,
        avgRating: 4.4,
        totalReviews: 21,
        minSystemSize: 3,
        maxSystemSize: 50,
        priceRangeMin: 50000,
        priceRangeMax: 200000,
      },
    },
    {
      email: "pretoria@solmatch.co.za",
      firstName: "Tshwane",
      lastName: "Energy",
      company: {
        companyName: "Tshwane Green Energy",
        registrationNo: "2018/321654/07",
        description: "Established 2018. Over 1000 residential systems installed in Pretoria and surrounding areas. Full design, supply, installation and maintenance packages.",
        province: "Gauteng",
        city: "Pretoria",
        phone: "012 555 0404",
        email: "info@tshwanegreenenergy.co.za",
        yearsExperience: 8,
        systemTypes: JSON.stringify(["residential","commercial","off-grid","hybrid"]),
        certifications: JSON.stringify(["SAPVIA","SAQCC","PV GreenCard","ECSA"]),
        verified: true,
        badgeActive: true,
        badgeExpiresAt: new Date("2026-12-01"),
        avgRating: 4.9,
        totalReviews: 89,
        minSystemSize: 3,
        maxSystemSize: 500,
        priceRangeMin: 55000,
        priceRangeMax: 1500000,
      },
    },
    {
      email: "stellenbosch@solmatch.co.za",
      firstName: "Winelands",
      lastName: "Solar",
      company: {
        companyName: "Winelands Solar & Storage",
        registrationNo: "2022/111222/07",
        description: "Specialising in farm, winery, and residential solar in the Cape Winelands. Agricultural tariff optimisation and off-grid expertise.",
        province: "Western Cape",
        city: "Stellenbosch",
        phone: "021 555 0505",
        email: "info@winelandssolar.co.za",
        yearsExperience: 3,
        systemTypes: JSON.stringify(["residential","agricultural","off-grid"]),
        certifications: JSON.stringify(["SAPVIA","PV GreenCard"]),
        verified: true,
        badgeActive: false,
        avgRating: 4.5,
        totalReviews: 14,
        minSystemSize: 5,
        maxSystemSize: 2000,
        priceRangeMin: 70000,
        priceRangeMax: 5000000,
      },
    },
  ];

  for (const data of installerData) {
    const installerUser = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        passwordHash: hash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "INSTALLER",
        consentGiven: true,
        consentTimestamp: new Date(),
      },
    });

    await prisma.installer.upsert({
      where: { userId: installerUser.id },
      update: {},
      create: { userId: installerUser.id, ...data.company },
    });
  }

  console.log("Seed complete.");
  console.log("Demo login: demo@solmatch.co.za / Password1");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
