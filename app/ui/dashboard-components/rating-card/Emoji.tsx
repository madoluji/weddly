import Image from "next/image";

// Define the component's props interface
interface Props {
  rating: number;
}

const Emoji = ({ rating }: Props) => {
  // Check the rating and return the corresponding image
  if (rating > 4) {
    // Display bull's eye emoji for rating above 4
    return (
      <Image
        src="/icons/bulls-eye.webp" // Path to the bull's eye image
        alt="bulls-eye"
        width={40}
        height={40}
      />
    );
  } else if (rating > 3) {
    // Display thumbs-up emoji for rating above 3
    return (
      <Image
        src="/icons/thumbs-up.webp" // Path to the thumbs-up image
        alt="thumbs-up"
        width={40}
        height={40}
      />
    );
  } else if (rating > 2.5) {
    // Display meh emoji for rating above 2.5
    return (
      <Image
        src="/icons/meh.webp" // Path to the meh image
        alt="meh"
        width={40}
        height={40}
      />
    );
  } else {
    // Display sad emoji for ratings 2.5 or below
    return (
      <Image
        src="/icons/sad.png" // Path to the sad image
        alt="sad"
        width={40}
        height={40}
      />
    );
  }
};

export default Emoji;
