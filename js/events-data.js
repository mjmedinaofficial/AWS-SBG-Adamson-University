(function () {
  const DEFAULT_EVENT_IMAGE_COUNT = 4;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function eventImagePath(number, index) {
    return `img/event${number}/event${number}-${index}.jpg`;
  }

  function buildEventImages(number, count) {
    const imageCount = typeof count === 'number' ? count : DEFAULT_EVENT_IMAGE_COUNT;
    return Array.from({ length: imageCount }, (_, i) => eventImagePath(number, i + 1));
  }

  function eventBadge(year, monthNum, day) {
    const eventDate = new Date(year, monthNum - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate >= today) {
      return { badge: 'Upcoming', badgeClass: 'upcoming' };
    }
    return { badge: 'Past Event', badgeClass: 'featured' };
  }

  const rawEvents = [
    {
      number: 1,
      title: "Chapter 1: FalCat's Journey into the Cloud",
      desc: "Get ready to follow the Purple Brick Road as we unveil the opportunities and resources AWS has in store for you. Whether you're just starting out or already cloud-curious, this is your gateway to a community of innovators and tech enthusiasts!",
      category: "community",
      tags: ["Beginner", "Community", "AWS Foundations"],
      monthNum: 10,
      day: "2",
      year: "2024",
      speaker: "Mr. Lesmon Saluta, Mr. Asi Guiang, Ms. Darla David"
    },
    {
      number: 2,
      title: "ECOTHON: Code For A Sustainable Metro Manila",
      desc: "In just 24 hours, the ECOTHON: Code For A Sustainable Metro Manila kicks off! Watch our talented Computer Science students merge their coding prowess with their dedication to the environment to tackle Metro Manila's most critical ecological challenges. Along with Adamson Computer Science Society (ACOMSS), we want to advocate for a greener Metro Manila through tech!",
      category: "hackathon",
      tags: ["Hackathon", "Sustainability", "24 Hours"],
      monthNum: 11,
      day: "11",
      year: "2024",
      speaker: "n/a",
      imageCount: 0
    },
    {
      number: 3,
      title: "Skillbuilder: Introduction to Cybersecurity",
      desc: "Shield up with Skillbuilder: Introduction to Cybersecurity, where we crack the codes, dodge the threats, and take control of our online spaces. No damsels in distress here—just future tech legends making their mark.",
      category: "workshop",
      tags: ["Cybersecurity", "Workshop", "Skillbuilder"],
      monthNum: 3,
      day: "22",
      year: "2025",
      speaker: "Mr. Asi Guiang",
      imageCount: 2
    },
    {
      number: 4,
      title: "Chapter 2: BuildHers+",
      desc: "Join Falcat as she pounces into a brand-new chapter and enters her BuildHer's Era! This is your chance to be part of a purr-fectly empowering day filled with learning, networking, and meow-some ideas. Whether you're already a tech queen or just a kitten starting to scratch the surface, this ideathon is designed to help you unleash your inner trailblazer.",
      category: "hackathon",
      tags: ["Ideathon", "Women in Tech", "Networking"],
      monthNum: 4,
      day: "5",
      year: "2025",
      speaker: "Ms. Maxine Ileto, Ms. Enrica Dio, Ms. Uriel Alonso",
      imageCount: 1
    },
    {
      number: 5,
      title: "Building Bridges",
      desc: "Join us for a motivational session with Kate, Chief Evangelist and Vice President of AWS Cloud Club Philippines, in collaboration with the Campus Ministry Office of Adamson University. This session is designed to inspire students to pursue growth, leadership, and innovation—going beyond boundaries to reach their fullest potential.",
      category: "community",
      tags: ["Motivational", "Leadership", "Community"],
      monthNum: 9,
      day: "30",
      year: "2025",
      speaker: "Ms. Kate Callao"
    },
    {
      number: 6,
      title: "Falcat and the Cloud Crew: A welcome to AWS",
      desc: "This welcome event is packed with team-building activities, an official turnover ceremony, and the introduction of our new officers. We'll also be hearing inspiring talks from AWS Cloud Club Philippines and AWS User Group speakers, giving members valuable insights into the cloud community. Expect fun icebreakers, dynamic networking, and knowledge-sharing sessions designed to strengthen connections and collaboration.",
      category: "community",
      tags: ["Welcome Event", "Networking", "Team Building"],
      monthNum: 10,
      day: "21",
      year: "2025",
      speaker: "Ms. Gaile Espinosa, Mr. Paul Sears"
    },
    {
      number: 7,
      title: "Cloud Nine: Deploying Your First App on the Cloud Workshop",
      desc: "In this workshop, we'll build and deploy a personal portfolio website using HTML, CSS, JavaScript, and Tailwind CSS, all of which will be hosted via cloud on AWS S3 with AWS CloudFront. The goal is to help beginners understand the fundamentals of deploying applications on the cloud.",
      category: "lab",
      tags: ["Hands-on Lab", "AWS S3", "CloudFront"],
      monthNum: 11,
      day: "20",
      year: "2025",
      speaker: "Mr. Gen Benedict Casio"
    },
    {
      number: 8,
      title: "AWS Student Community Night",
      desc: "The AWS Student Community Night is a networking event for students across the Philippines, specifically in Luzon. It brings together AWS global representatives, AWS User Group leaders, and community leaders to share real experiences, insights, and perspectives. Through stories from AWS Cloud Club members, the event highlights how the AWS community helps shape student journeys while promoting mentorship, meaningful connections, and technical skill development—bridging the gap between academia and the industry.",
      category: "community",
      tags: ["Networking", "Community", "Mentorship"],
      monthNum: 1,
      day: "26",
      year: "2026",
      speaker: "Mr. Josh Kenn Viray, Ms. Gaile Espinosa"
    },
    {
      number: 9,
      title: "ARE YOU LEGIT OR LE-GPT? Outreach Event",
      desc: "AWS Cloud Club – Adamson University brought Legit or Le-GPT? Teaching Young Minds to Think Smart Online to children aged 8–14 at Asociacion de Damas de Filipinas, Inc. Through interactive activities and discussions, our participants learned how to spot AI-generated content, verify online information, and navigate the digital world responsibly.",
      category: "community",
      tags: ["Outreach", "AI Literacy", "Community"],
      monthNum: 2,
      day: "7",
      year: "2026",
      speaker: "Mr. Kelvin Ignacio"
    },
    {
      number: 10,
      title: "JumpStart with Falcat: Applied Fundamentals to AWS",
      desc: "From foundations to actual building, we're turning your cloud fantasy into reality! This is a 3-day hybrid workshop that provides a comprehensive, hands-on journey from AWS cloud foundations to building a live, full-stack application. Come join us in learning how to integrate Amazon EC2, S3, and RDS while deploying a functional Flask backend and web frontend.",
      category: "workshop",
      tags: ["Workshop", "Full-Stack", "EC2"],
      monthNum: 4,
      day: "9",
      year: "2026",
      speaker: "Mr. Emmanuel Manlulu, Mr. MJ Medina, Mr. Timothy Lastrilla"
    },
    {
      number: 11,
      title: "Eco - AI with Falcat: Cloud-Powered Gen AI for a Greener Future",
      desc: "Discover how innovation and technology can help create a more sustainable environment. Explore cloud-powered generative AI and learn practical approaches to building greener solutions with AWS.",
      category: "workshop",
      tags: ["Generative AI", "Sustainability", "Workshop"],
      monthNum: 5,
      day: "8",
      year: "2026",
      speaker: "Mr. MJ Medina"
    }
  ];

  window.SBG_EVENTS = rawEvents
    .sort((a, b) => b.number - a.number)
    .map((ev) => {
      const images = ev.images || buildEventImages(ev.number, ev.imageCount);
      const year = parseInt(ev.year, 10);
      const monthNum = ev.monthNum;
      const { badge, badgeClass } = eventBadge(year, monthNum, parseInt(ev.day, 10));
      return {
        id: `event-${ev.number}`,
        number: ev.number,
        title: ev.title,
        desc: ev.desc,
        month: MONTHS[monthNum - 1],
        day: ev.day,
        year: ev.year,
        monthNum,
        badge,
        badgeClass,
        category: ev.category,
        image: images[0] ?? null,
        images,
        speaker: ev.speaker,
        avatar: ev.speaker === 'n/a' ? 'N/A' : ev.speaker.split(',')[0].trim(),
        tags: ev.tags
      };
    });

  // Homepage Section 2: how many of the newest events to show (first N on All Events).
  window.SBG_FEATURED_EVENT_COUNT = 3;

  const eventCount = window.SBG_EVENTS.length;
  document.querySelectorAll('[data-finder-footer-events]').forEach((el) => {
    el.textContent = `${eventCount} events`;
  });
})();
