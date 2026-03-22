import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface Props {
  rating: number; // Rating value to determine how many stars to show
}

// Function to render stars based on the rating
const starRender = (rating: number) => {
  let stars = [];
  for (let i = 0; i < 5; i++) {
    // Loop through 5 stars
    if (i < rating) {
      // Render solid star if index is less than the rating
      stars.push(<StarSolid key={i} className="h-5 w-5 text-primary-500" />);
    } else {
      // Render outline star if index is greater than or equal to the rating
      stars.push(<StarOutline key={i} className="h-5 w-5 text-primary-500" />);
    }
  }
  return stars; // Return the array of stars
};

const StarRating = ({ rating }: Props) => {
  return (
    <div className="flex gap-1">
      {/* Render the stars based on the rating */}
      {starRender(rating)}
    </div>
  );
};

export default StarRating;
