import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();
async function main(){
  if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD){
    const passwordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
    await prisma.user.upsert({where:{email:process.env.ADMIN_EMAIL.toLowerCase()},update:{passwordHash,role:Role.ADMIN,isVerified:true},create:{email:process.env.ADMIN_EMAIL.toLowerCase(),passwordHash,role:Role.ADMIN,isVerified:true}});
    console.log('Admin bootstrap dibuat dari environment.');
  }
  const facility = await prisma.healthcareFacility.upsert({
    where:{id:'demo-facility-juzara'},
    update:{},
    create:{id:'demo-facility-juzara',name:'Fasilitas Kesehatan Demo',type:'Klinik',address:'Alamat belum diverifikasi — data demonstrasi',region:'Makassar, Sulawesi Selatan',phone:null,openingHours:'Data operasional belum dikonfirmasi',isDemo:true,services:{create:[{name:'Konsultasi umum',description:'Layanan contoh untuk pengujian aplikasi'},{name:'Pemeriksaan dasar',description:'Layanan contoh; bukan layanan nyata'}]}}
  });
  const doctors=[
    {name:'dr. Zaskiya Dwi Anugrah',specialty:'Dokter umum',key:'DOCTOR_1',email:'zaskiya@juzara.id',license:'PENDING-VERIFY-DOCTOR-1'},
    {name:'drg. Bayu Liburaya',specialty:'Dokter gigi',key:'DOCTOR_2',email:'bayu@juzara.id',license:'PENDING-VERIFY-DOCTOR-2'},
    {name:'dr. Juniar Rahman Sp.DP',specialty:'Spesialis penyakit dalam',key:'DOCTOR_3',email:'juniar@juzara.id',license:'PENDING-VERIFY-DOCTOR-3'},
    {name:'dr. Muhammad Zidan Sp.A',specialty:'Spesialis anak',key:'DOCTOR_4',email:'zidan@juzara.id',license:'PENDING-VERIFY-DOCTOR-4'},
    {name:'dr. Zahra Nur Habibah Sp.OG',specialty:'Spesialis kandungan',key:'DOCTOR_5',email:'zahra@juzara.id',license:'PENDING-VERIFY-DOCTOR-5'}
  ];
  for(const [i,d] of doctors.entries()){
    const email=(process.env[`${d.key}_EMAIL`]||d.email).toLowerCase();
    const password=process.env[`${d.key}_PASSWORD`];
    // Doctor credentials are never hard-coded. Configure a unique 12+ character secret per account.
    if(!password){
      console.log(`${d.name}: account seed skipped; set ${d.key}_PASSWORD and ${d.key}_EMAIL before rerunning seed.`);
      continue;
    }
    if(password.length<12) throw new Error(`${d.key}_PASSWORD must contain at least 12 characters.`);
    const passwordHash=await bcrypt.hash(password,12);
    const user=await prisma.user.upsert({where:{email},update:{passwordHash,role:Role.DOCTOR,isVerified:true},create:{email,passwordHash,role:Role.DOCTOR,isVerified:true}});
    const doctor=await prisma.doctor.upsert({where:{userId:user.id},update:{displayName:d.name,specialty:d.specialty,verifiedAt:new Date()},create:{userId:user.id,displayName:d.name,specialty:d.specialty,licenseNumber:null,verifiedAt:new Date()}});
    await prisma.doctorFacility.upsert({where:{doctorId_facilityId:{doctorId:doctor.id,facilityId:facility.id}},update:{},create:{doctorId:doctor.id,facilityId:facility.id}});
    await prisma.doctorSchedule.upsert({where:{id:`demo-schedule-${i+1}`},update:{},create:{id:`demo-schedule-${i+1}`,doctorId:doctor.id,facilityId:facility.id,weekday:i+1,startTime:['08:00','13:00','10:00','08:00','13:00'][i],endTime:['12:00','17:00','15:00','12:00','17:00'][i],quota:20,slotMinutes:20,isActive:true,note:'Jadwal contoh; wajib dikonfirmasi fasilitas kesehatan'}});
    console.log(`Verified doctor account provisioned: ${d.name} (${email})`);
  }
  console.log('Seed demo selesai:',facility.name,'— semua data fasilitas/jadwal berstatus demonstrasi.');
}
main().finally(()=>prisma.$disconnect());
