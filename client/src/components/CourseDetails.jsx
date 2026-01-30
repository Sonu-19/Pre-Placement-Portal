import { useLocation, useParams } from "react-router-dom";

const CourseDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const course = location.state;

  if (!course) {
    return <h2 style={{ padding: "20px" }}>Course not found</h2>;
  }

  return (
    <div className="course-details container">
      <h1>{course.name}</h1>
      <p>{course.description}</p>

      <p><strong>Category:</strong> {course.category}</p>
      <p><strong>Progress:</strong> {course.progress}%</p>
      <p><strong>Resources:</strong> {course.resources}</p>

      <button className="tech-action-btn">
        Start Learning
      </button>
    </div>
  );
};

export default CourseDetails;
