import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface Props {
  rating: number;
}

const starRender = (rating: number) => {
  let stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      stars.push(<StarSolid key={i} className="h-5 w-5 text-primary-500" />);
    } else {
      stars.push(<StarOutline key={i} className="h-5 w-5 text-primary-500" />);
    }
  }
  return stars;
};

const StarRating = ({ rating }: Props) => {
  return <div className="flex gap-1">{starRender(rating)}</div>;
};

export default StarRating;
