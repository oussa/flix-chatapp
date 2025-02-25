import { eq } from 'drizzle-orm';
import '../environment';
import { db } from './db';
import { helpTopics, helpContent, agents } from './schema';

// Help topics data for seeding - arranged in the order shown in the UI
const topicsData = [
  // Topics in the order shown in the image
  {
    title: 'Request a Refund',
    icon: 'RotateCcw',
    slug: 'refund',
    content: `
      <h2>Refund Process</h2>
      <p>To request a refund for your booking, follow these steps:</p>
      <ol>
        <li>Log in to your account</li>
        <li>Navigate to "My Bookings"</li>
        <li>Select the booking you wish to cancel</li>
        <li>Click on "Request Refund"</li>
        <li>Follow the on-screen instructions</li>
      </ol>
      
      <h2>Refund Eligibility</h2>
      <p>Refund eligibility depends on when you cancel:</p>
      <ul>
        <li>More than 72 hours before departure: Full refund minus a small service fee</li>
        <li>24-72 hours before departure: 50% refund</li>
        <li>Less than 24 hours before departure: No refund</li>
      </ul>
      
      <h2>Refund Processing Time</h2>
      <p>Refunds are typically processed within 5-7 business days and will be returned to the original payment method.</p>
    `,
  },
  {
    title: 'Manage Your Bookings',
    icon: 'Calendar',
    slug: 'bookings',
    content: `
      <h2>Accessing Your Bookings</h2>
      <p>You can access and manage all your bookings through your account dashboard. Simply log in and click on "My Bookings".</p>
      
      <h2>Booking Modifications</h2>
      <p>To modify a booking:</p>
      <ol>
        <li>Select the booking you wish to modify</li>
        <li>Click on "Modify Booking"</li>
        <li>Make your desired changes</li>
        <li>Confirm and pay any difference in fare if applicable</li>
      </ol>
      
      <h2>Booking Cancellations</h2>
      <p>To cancel a booking, select the booking and click on "Cancel Booking". Please note that cancellation fees may apply depending on how close to departure you cancel.</p>
    `,
  },
  {
    title: 'Route and Delay Info',
    icon: 'Map',
    slug: 'route',
    content: `
      <h2>Checking Route Information</h2>
      <p>You can view detailed route information for your trip by logging into your account and selecting your booking. This includes all stops along the route and estimated arrival times.</p>
      
      <h2>Real-time Updates</h2>
      <p>We provide real-time updates on delays and changes to your trip. You can check the status of your trip through our app or website.</p>
      
      <h2>Delay Notifications</h2>
      <p>If your trip is delayed, we'll send you notifications via email and SMS. Make sure your contact information is up to date in your account settings.</p>
    `,
  },
  {
    title: 'Payment Problems',
    icon: 'CreditCard',
    slug: 'payment',
    content: `
      <h2>Accepted Payment Methods</h2>
      <p>We accept the following payment methods:</p>
      <ul>
        <li>Credit cards (Visa, Mastercard, American Express)</li>
        <li>Debit cards</li>
        <li>PayPal</li>
        <li>Apple Pay (on iOS devices)</li>
        <li>Google Pay (on Android devices)</li>
      </ul>
      
      <h2>Refund Policy</h2>
      <p>Refund eligibility depends on when you cancel:</p>
      <ul>
        <li>More than 72 hours before departure: Full refund minus a small service fee</li>
        <li>24-72 hours before departure: 50% refund</li>
        <li>Less than 24 hours before departure: No refund</li>
      </ul>
      <p>Refunds are processed back to the original payment method within 5-7 business days.</p>
    `,
  },
  {
    title: 'Baggage',
    icon: 'Luggage',
    slug: 'baggage',
    content: `
      <h2>Baggage Allowance</h2>
      <p>Each passenger can bring:</p>
      <ul>
        <li>1 piece of hand luggage (max. 42 x 30 x 18 cm)</li>
        <li>1 piece of luggage for the luggage compartment (max. 80 x 50 x 30 cm)</li>
      </ul>
      
      <h2>Extra Baggage</h2>
      <p>Need to bring more? You can book additional baggage for an extra fee when making your reservation or by modifying your booking later.</p>
      
      <h2>Special Items</h2>
      <p>Special items such as musical instruments, sports equipment, or mobility aids may require special handling. Please contact our customer service in advance to arrange for these items.</p>
    `,
  },
  {
    title: 'Book a Ticket',
    icon: 'Ticket',
    slug: 'booking',
    content: `
      <h2>How to Book a Trip</h2>
      <p>Booking a trip with FLIX is easy! Simply follow these steps:</p>
      <ol>
        <li>Visit our website or open our mobile app</li>
        <li>Enter your departure and destination cities</li>
        <li>Select your travel dates</li>
        <li>Choose from available trips</li>
        <li>Enter passenger information</li>
        <li>Select any add-ons (extra luggage, seat selection)</li>
        <li>Complete payment</li>
      </ol>
      <p>Once your booking is complete, you'll receive a confirmation email with your e-ticket.</p>
      
      <h2>Booking Modifications</h2>
      <p>Need to change your booking? You can modify your trip up to 15 minutes before departure through your account or by contacting customer service.</p>
    `,
  },
  {
    title: 'Vouchers',
    icon: 'Tag',
    slug: 'vouchers',
    content: `
      <h2>Using Vouchers</h2>
      <p>To redeem a voucher:</p>
      <ol>
        <li>Start a new booking</li>
        <li>Enter your travel details</li>
        <li>On the payment page, enter your voucher code in the designated field</li>
        <li>The voucher amount will be deducted from your total</li>
      </ol>
      
      <h2>Voucher Validity</h2>
      <p>Vouchers are typically valid for 12 months from the date of issue. The expiration date is indicated on the voucher.</p>
      
      <h2>Checking Voucher Balance</h2>
      <p>You can check your voucher balance by logging into your account and navigating to "My Vouchers".</p>
    `,
  },
  {
    title: 'Feedback',
    icon: 'MessageCircle',
    slug: 'feedback',
    content: `
      <h2>Submitting Feedback</h2>
      <p>We value your feedback! You can submit your comments, suggestions, or complaints through:</p>
      <ul>
        <li>Our website's feedback form</li>
        <li>Our mobile app</li>
        <li>Email to feedback@flix.com</li>
        <li>Customer service phone line</li>
      </ul>
      
      <h2>Trip Reviews</h2>
      <p>After completing a trip, you'll receive an email inviting you to review your experience. Your reviews help us improve our service.</p>
      
      <h2>Feedback Processing</h2>
      <p>All feedback is reviewed by our customer experience team. We aim to address all concerns within 48 hours.</p>
    `,
  },
  {
    title: 'Booking for Children',
    icon: 'Baby',
    slug: 'children',
    content: `
      <h2>Child Tickets</h2>
      <p>Children under 3 years travel for free when sitting on a parent's lap. Children aged 3-11 are eligible for discounted fares.</p>
      
      <h2>Unaccompanied Minors</h2>
      <p>Children under 16 must be accompanied by a passenger who is at least 18 years old. We do not offer an unaccompanied minor service.</p>
      
      <h2>Child Safety</h2>
      <p>All children must comply with local safety regulations. This may include the use of appropriate child restraint systems depending on the child's age and size.</p>
    `,
  },
  {
    title: 'Passengers with Disabilities',
    icon: 'Accessibility',
    slug: 'disabilities',
    content: `
      <h2>Accessibility Features</h2>
      <p>Many of our buses are equipped with accessibility features, including:</p>
      <ul>
        <li>Wheelchair lifts or ramps</li>
        <li>Designated wheelchair spaces</li>
        <li>Priority seating</li>
      </ul>
      
      <h2>Assistance Requests</h2>
      <p>If you require special assistance, please notify us at least 48 hours before your trip by contacting our customer service.</p>
      
      <h2>Service Animals</h2>
      <p>Service animals are welcome on all our buses. No additional fee is charged for service animals.</p>
    `,
  },
  {
    title: 'Security',
    icon: 'Lock',
    slug: 'security',
    content: `
      <h2>On-board Security</h2>
      <p>Your safety is our priority. All our buses are equipped with security cameras and GPS tracking systems.</p>
      
      <h2>Lost & Found</h2>
      <p>If you've left something on one of our buses, please contact our lost and found department as soon as possible. Items are kept for 30 days.</p>
      
      <h2>Security Checks</h2>
      <p>Random security checks may be conducted at some stations. Please arrive with sufficient time to complete any security procedures.</p>
    `,
  },
  {
    title: 'Contact Us',
    icon: 'Mail',
    slug: 'contact',
    content: `
      <h2>Customer Service</h2>
      <p>Our customer service team is available 24/7 to assist you with any questions or concerns.</p>
      
      <h2>Contact Methods</h2>
      <p>You can reach us through:</p>
      <ul>
        <li>Phone: +1-800-FLIX-BUS</li>
        <li>Email: support@flix.com</li>
        <li>Live chat on our website or app</li>
        <li>Social media: @FlixBus on Twitter, Facebook, and Instagram</li>
      </ul>
      
      <h2>Office Locations</h2>
      <p>Our main offices are located in Munich, Berlin, Paris, and Los Angeles. Visit our website for specific address details.</p>
    `,
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('Clearing existing help content...');
    await db.delete(helpContent);
    
    console.log('Clearing existing help topics...');
    await db.delete(helpTopics);

    console.log('Clearing existing agent data...');
    await db.delete(agents).where(eq(agents.email, 'agent'));

    // Insert help topics
    console.log('Inserting help topics...');
    for (const [index, topic] of topicsData.entries()) {
      const [insertedTopic] = await db.insert(helpTopics).values({
        title: topic.title,
        icon: topic.icon,
        slug: topic.slug,
        sortOrder: index + 1, // Start from 1
      }).returning();

      // Insert help content for this topic
      console.log(`Inserting content for topic: ${topic.title}`);
      await db.insert(helpContent).values({
        topicId: insertedTopic.id,
        content: topic.content,
      });
    }

    // Insert initial agent user
    console.log('Inserting initial agent user...');
    await db.insert(agents).values({
      email: 'agent',
      name: 'Bob',
      password: '$2a$12$WaaSxiG3yKMIPzx5loVVKuWYnlLL5g4xCgdcE/PBd9.JTNWyEdrwC', // use agent for login and agent for password
    });

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seed();
