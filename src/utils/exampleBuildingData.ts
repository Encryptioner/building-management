import type { Building } from '../types';

/**
 * Generate example building data with sample flats and residents
 * This helps users understand the feature without entering data manually
 */
export function generateExampleBuildingData(): Building {
  const buildingId = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    id: buildingId,
    name: 'গ্রিন টাওয়ার (Green Tower)',
    address: 'গুলশান-২, ঢাকা-১২১২ (Gulshan-2, Dhaka-1212)',
    totalFloors: 5,
    flats: [
      // Ground Floor
      {
        id: crypto.randomUUID(),
        flatNumber: 'G-1',
        floorNumber: 'G',
        ownershipType: 'owned',
        motorcycleParkingCount: 1,
        carParkingCount: 0,
        notes: 'গ্রাউন্ড ফ্লোর, রাস্তার পাশে (Ground floor, street side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'মো. রহিম আহমেদ (Md. Rahim Ahmed)',
            phone: '+880 1712-345678',
            email: 'rahim.ahmed@email.com',
            nid: '1234567890',
            moveInDate: '2020-01-15',
            notes: 'মালিক, পরিবার সহ ৪ জন (Owner, family of 4)',
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        flatNumber: 'G-2',
        floorNumber: 'G',
        ownershipType: 'rented',
        motorcycleParkingCount: 0,
        carParkingCount: 1,
        notes: 'গ্রাউন্ড ফ্লোর, বাগানের পাশে (Ground floor, garden side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'সারাহ খান (Sarah Khan)',
            phone: '+880 1812-345678',
            email: 'sarah.khan@email.com',
            moveInDate: '2023-06-01',
            notes: 'ভাড়াটিয়া, স্বামী-স্ত্রী (Tenant, couple)',
          },
        ],
      },
      // Floor 1
      {
        id: crypto.randomUUID(),
        flatNumber: '1A',
        floorNumber: '1',
        ownershipType: 'owned',
        motorcycleParkingCount: 2,
        carParkingCount: 0,
        notes: '১ম তলা, পূর্ব দিক (1st floor, east side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'ড. করিম হোসেন (Dr. Karim Hossain)',
            phone: '+880 1912-345678',
            email: 'karim.hossain@email.com',
            nid: '2345678901',
            moveInDate: '2019-03-10',
            notes: 'মালিক, চিকিৎসক (Owner, physician)',
          },
          {
            id: crypto.randomUUID(),
            name: 'নাজনীন হোসেন (Naznin Hossain)',
            phone: '+880 1712-876543',
            email: 'naznin.h@email.com',
            moveInDate: '2019-03-10',
            notes: 'স্ত্রী (Spouse)',
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        flatNumber: '1B',
        floorNumber: '1',
        ownershipType: 'rented',
        motorcycleParkingCount: 0,
        carParkingCount: 0,
        notes: '১ম তলা, পশ্চিম দিক (1st floor, west side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'তানিয়া ইসলাম (Tania Islam)',
            phone: '+880 1612-345678',
            email: 'tania.islam@email.com',
            moveInDate: '2024-01-15',
            notes: 'ভাড়াটিয়া, একা থাকেন (Tenant, lives alone)',
          },
        ],
      },
      // Floor 2
      {
        id: crypto.randomUUID(),
        flatNumber: '2A',
        floorNumber: '2',
        ownershipType: 'owned',
        motorcycleParkingCount: 0,
        carParkingCount: 1,
        notes: '২য় তলা, পূর্ব দিক (2nd floor, east side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'আবুল হাসান (Abul Hasan)',
            phone: '+880 1512-345678',
            email: 'abul.hasan@email.com',
            nid: '3456789012',
            moveInDate: '2018-07-20',
            notes: 'মালিক, ব্যবসায়ী (Owner, businessman)',
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        flatNumber: '2B',
        floorNumber: '2',
        ownershipType: 'owned',
        motorcycleParkingCount: 1,
        carParkingCount: 0,
        notes: '২য় তলা, পশ্চিম দিক (2nd floor, west side)',
        residents: [],
      },
      // Floor 3
      {
        id: crypto.randomUUID(),
        flatNumber: '3A',
        floorNumber: '3',
        ownershipType: 'rented',
        motorcycleParkingCount: 1,
        carParkingCount: 0,
        notes: '৩য় তলা, পূর্ব দিক (3rd floor, east side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'রাজিব চৌধুরী (Rajib Chowdhury)',
            phone: '+880 1312-345678',
            email: 'rajib.ch@email.com',
            moveInDate: '2023-09-01',
            notes: 'ভাড়াটিয়া, সফটওয়্যার ইঞ্জিনিয়ার (Tenant, software engineer)',
          },
          {
            id: crypto.randomUUID(),
            name: 'প্রিয়া চৌধুরী (Priya Chowdhury)',
            phone: '+880 1712-567890',
            email: 'priya.ch@email.com',
            moveInDate: '2023-09-01',
            notes: 'স্ত্রী, শিক্ষক (Spouse, teacher)',
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        flatNumber: '3B',
        floorNumber: '3',
        ownershipType: 'owned',
        motorcycleParkingCount: 0,
        carParkingCount: 1,
        notes: '৩য় তলা, পশ্চিম দিক (3rd floor, west side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'ফারহানা আক্তার (Farhana Akter)',
            phone: '+880 1812-567890',
            email: 'farhana.akter@email.com',
            moveInDate: '2021-04-10',
            notes: 'মালিক, ডিজাইনার (Owner, designer)',
          },
        ],
      },
      // Floor 4
      {
        id: crypto.randomUUID(),
        flatNumber: '4A',
        floorNumber: '4',
        ownershipType: 'owned',
        motorcycleParkingCount: 1,
        carParkingCount: 1,
        notes: '৪র্থ তলা, পূর্ব দিক (4th floor, east side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'নাসির উদ্দিন (Nasir Uddin)',
            phone: '+880 1612-567890',
            email: 'nasir.uddin@email.com',
            nid: '4567890123',
            moveInDate: '2017-11-01',
            notes: 'মালিক, আর্কিটেক্ট (Owner, architect)',
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        flatNumber: '4B',
        floorNumber: '4',
        ownershipType: 'rented',
        motorcycleParkingCount: 0,
        carParkingCount: 0,
        notes: '৪র্থ তলা, পশ্চিম দিক (4th floor, west side)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'সাইমা রহমান (Saima Rahman)',
            phone: '+880 1912-567890',
            email: 'saima.rahman@email.com',
            moveInDate: '2024-02-01',
            notes: 'ভাড়াটিয়া, ব্যাংক অফিসার (Tenant, bank officer)',
          },
        ],
      },
      // Floor 5
      {
        id: crypto.randomUUID(),
        flatNumber: '5A',
        floorNumber: '5',
        ownershipType: 'owned',
        motorcycleParkingCount: 2,
        carParkingCount: 1,
        notes: '৫ম তলা, পূর্ব দিক, ছাদ অ্যাক্সেস (5th floor, east side, roof access)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'জামাল হক (Jamal Haque)',
            phone: '+880 1512-567890',
            email: 'jamal.haque@email.com',
            nid: '5678901234',
            moveInDate: '2016-08-15',
            notes: 'মালিক, আইনজীবী, পরিবার সহ ৫ জন (Owner, lawyer, family of 5)',
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        flatNumber: '5B',
        floorNumber: '5',
        ownershipType: 'owned',
        motorcycleParkingCount: 0,
        carParkingCount: 1,
        notes: '৫ম তলা, পশ্চিম দিক, ছাদ অ্যাক্সেস (5th floor, west side, roof access)',
        residents: [
          {
            id: crypto.randomUUID(),
            name: 'সেলিনা বেগম (Selina Begum)',
            phone: '+880 1312-567890',
            email: 'selina.begum@email.com',
            moveInDate: '2022-05-20',
            notes: 'মালিক, উদ্যোক্তা (Owner, entrepreneur)',
          },
          {
            id: crypto.randomUUID(),
            name: 'ইমরান বেগম (Imran Begum)',
            phone: '+880 1712-987654',
            email: 'imran.b@email.com',
            moveInDate: '2022-05-20',
            notes: 'স্বামী, প্রকৌশলী (Spouse, engineer)',
          },
        ],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
