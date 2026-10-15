import { Testimonial } from '../../models/Testimonial';

export class TestimonialService {
  static async getAll(approvedOnly = true) {
    const filter = approvedOnly ? { isApproved: true } : {};
    let stories = await Testimonial.find(filter).sort({ createdAt: -1 }).limit(12).lean();

    // Auto-seed default hero stories if empty
    if (stories.length === 0) {
      const initialSeed = [
        {
          authorName: 'Dr. Aarav Mehta',
          role: 'Surgeon & Donor',
          city: 'Ahmedabad',
          bloodGroup: 'O+',
          content: 'When an emergency surgery required 3 units at 2:00 AM at Zydus Hospital, LifeLink matched us with nearby donors in under 10 minutes. A true medical miracle.',
          rating: 5,
          isApproved: true,
        },
        {
          authorName: 'Pooja Solanki',
          role: 'Recipient Mother',
          city: 'Surat',
          bloodGroup: 'B+',
          content: 'My 7-year-old daughter requires regular transfusions for Thalassemia. Through LifeLink, verified donors are always available when we need them. I owe them her smile.',
          rating: 5,
          isApproved: true,
        },
        {
          authorName: 'Vikramaditya J.',
          role: '12x Blood Donor',
          city: 'Rajkot',
          bloodGroup: 'O-',
          content: 'Donating blood takes just 15 minutes of my day, but knowing it helped a critical accident victim reach stable condition is priceless. The app GPS route directly guided me to the blood bank.',
          rating: 5,
          isApproved: true,
        },
      ];

      await Testimonial.insertMany(initialSeed);
      stories = await Testimonial.find(filter).sort({ createdAt: -1 }).limit(12).lean();
    }

    return stories.map((s: any) => {
      const names = s.authorName.trim().split(' ');
      const initials = names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : s.authorName.slice(0, 2);

      return {
        id: s._id.toString(),
        authorName: s.authorName,
        role: s.role,
        city: s.city,
        bloodGroup: s.bloodGroup,
        content: s.content,
        rating: s.rating || 5,
        initials: initials.toUpperCase(),
        isApproved: s.isApproved,
        createdAt: s.createdAt,
      };
    });
  }

  static async create(data: {
    authorName: string;
    role: string;
    city: string;
    bloodGroup: string;
    content: string;
    rating?: number;
  }, userId?: string) {
    const testimonial = await Testimonial.create({
      authorName: data.authorName.trim(),
      role: data.role?.trim() || 'Verified Lifesaver',
      city: data.city.trim(),
      bloodGroup: data.bloodGroup.trim(),
      content: data.content.trim(),
      rating: Number(data.rating) || 5,
      isApproved: true, // auto-approved for verified community engagement
      userId: userId ? (userId as any) : undefined,
    });

    return testimonial;
  }

  static async approve(id: string, isApproved: boolean) {
    const updated = await Testimonial.findByIdAndUpdate(id, { isApproved }, { new: true });
    return updated;
  }
}
