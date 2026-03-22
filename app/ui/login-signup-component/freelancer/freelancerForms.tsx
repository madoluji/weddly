"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "@/app/ui/button";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase"; // Import Firebase storage
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { jobCategories, skills as predefinedSkills } from "@/app/lib/data";
import { languageTags } from "@/app/lib/data";

export type project = {
  projectTitle: string;
  projectDescription: string;
  technologies: string[];
  portfolioFiles?: string[];
};

export type work = {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
};

export type institution = {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
};

type FormData = {
  location: string;
  skills: string[];
  industries: string[];
  workExperience?: work[];
  projectPortfolio?: project[];
  education?: institution[];
  bio: string;
  languages: string[];
  rate: number;
};

const defaultPortfolioItem = {
  projectTitle: "",
  projectDescription: "",
  technologies: [],
  portfolioFiles: [],
};

const defaultWorkExperienceItem = {
  jobTitle: "",
  company: "",
  startDate: "", // Format as YYYY-MM-DD
  endDate: "",
};

const defaultEducationItem = {
  degree: "",
  institution: "",
  startDate: new Date().toISOString().slice(0, 10), // Format as YYYY-MM-DD
  endDate: new Date().toISOString().slice(0, 10),
};

const MultiStepForm = () => {
  // Define initial form data using the FormData type
  const initialFormData: FormData = {
    location: "",
    skills: [],
    industries: [],
    workExperience: [],
    projectPortfolio: [],
    education: [],
    bio: "",
    languages: [],
    rate: 0,
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [files, setFiles] = useState<{ [key: number]: File[] }>([]); // Store file data
  // State to handle input for tag fields (skills, languages, etc.)
  const [tagInput, setTagInput] = useState<{ [key: string]: string }>({
    skills: "",
    languages: "",
    industries: "",
  });

  /**
   * Handles adding/removing tags dynamically
   * @param e - Keyboard event (for Enter key)
   * @param field - Field name (skills, languages, etc.)
   */
  const handleTagChange = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "skills" | "languages" | "industries"
  ) => {
    if (e.key === "Enter" && tagInput[field].trim()) {
      e.preventDefault();
      if (!formData[field].includes(tagInput[field].trim())) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...prev[field], tagInput[field].trim()],
        }));
      }
      setTagInput((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /**
   * Handles removing tags from any tag field (skills, languages)
   * @param field - Field name (skills, languages, etc.)
   * @param tag - Tag to remove
   */
  const removeTag = (
    field: "skills" | "languages" | "industries",
    tag: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((t) => t !== tag),
    }));
  };

  // Filters recommendations for skills and languages
  const filteredRecommendations = {
    skills: predefinedSkills.filter(
      (skill) =>
        skill.toLowerCase().includes(tagInput.skills.toLowerCase()) &&
        !formData.skills.includes(skill)
    ),
    languages: languageTags.filter(
      (language) =>
        language.toLowerCase().includes(tagInput.languages.toLowerCase()) &&
        !formData.languages.includes(language)
    ),
    industries: jobCategories.filter(
      (industry) =>
        industry.toLowerCase().includes(tagInput.industries.toLowerCase()) &&
        !formData.industries.includes(industry)
    ),
  };

  // Function to add an item to an array field files
  const handleAddItem = (field: ArrayFieldKey, defaultItem: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: [...(prevState[field] || []), defaultItem],
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file selection for a specific project
  const handleFileChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => ({
        ...prev,
        [index]: [...(prev[index] || []), ...selectedFiles],
      }));
    }
  };

  // Remove a file from a specific project
  const handleRemoveFile = (projectIndex: number, fileIndex: number) => {
    setFiles((prev) => ({
      ...prev,
      [projectIndex]: prev[projectIndex].filter((_, i) => i !== fileIndex),
    }));
  };

  type ArrayFieldKey = "projectPortfolio" | "workExperience" | "education";

  const handleObjectArrayChange = (
    field: ArrayFieldKey, // e.g., "projectPortfolio", "workExperience"
    index: number,
    name: string,
    value: string
  ) => {
    setFormData((prevState) => {
      const updatedArray = [...(prevState[field] || [])] as any; // Type assertion for dynamic access
      updatedArray[index] = {
        ...updatedArray[index],
        [name]:
          name === "technologies"
            ? value.split(",").map((tech) => tech.trim())
            : value,
      };
      return {
        ...prevState,
        [field]: updatedArray,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setUploading(true);

      // Upload files for each project
      const updatedProjects = formData.projectPortfolio
        ? await Promise.all(
            formData.projectPortfolio.map(async (project, index) => {
              const projectFiles = files[index] || [];
              const fileUrls = await Promise.all(
                projectFiles.map(async (file) => {
                  const fileRef = ref(storage, `portfolios/${file.name}`);
                  await uploadBytes(fileRef, file);
                  return getDownloadURL(fileRef);
                })
              );
              return {
                ...project,
                portfolioFiles: fileUrls,
              };
            })
          )
        : [];

      const finalFormData = {
        ...formData,
        projectPortfolio: updatedProjects,
      };

      const response = await fetchWithAuth("/api/freelancerInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });

      if (response.ok) {
        setFormData(initialFormData);
        setFiles({});
        router.push(`/`);
      } else {
        alert("Error submitting portfolio.");
      }
    } catch (error) {
      console.error("An error occurred while submitting the form", error);
    }
  };

  const stepTitles = [
    "Personal Information",
    "Project Portfolio",
    "Work Experience",
    "Education",
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto ">
      <h2 className="text-lg font-semibold mb-4">{stepTitles[step]}</h2>

      {/* Step 1: Personal Information */}
      {step === 0 && (
        <>
          <div>
            <label className="block">
              Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              name="bio"
              rows={3}
            />
          </div>
          <div>
            <label className="block">
              Location
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              name="location"
            />
          </div>
          {/* Skills Input */}
          <div>
            <label className="block">
              Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[40px]">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-800 px-2 py-1 rounded-md text-sm cursor-pointer"
                  onClick={() => removeTag("skills", skill)}
                >
                  {skill} ✕
                </span>
              ))}
              <input
                type="text"
                value={tagInput.skills}
                onChange={(e) =>
                  setTagInput({ ...tagInput, skills: e.target.value })
                }
                onKeyDown={(e) => handleTagChange(e, "skills")}
                className="border-none outline-none flex-grow"
                placeholder="Type a skill and press Enter..."
              />
            </div>

            {/* Recommended skills dropdown */}
            {tagInput.skills && filteredRecommendations.skills.length > 0 && (
              <div className="border rounded-md mt-2 p-2 bg-white shadow-md max-h-40 overflow-y-auto">
                {filteredRecommendations.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="p-1 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        skills: [...prev.skills, skill],
                      }));
                      setTagInput({ ...tagInput, skills: "" });
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Industries Input */}
          <div>
            <label className="block">
              Industries <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[40px]">
              {formData.industries.map((industries, index) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-800 px-2 py-1 rounded-md text-sm cursor-pointer"
                  onClick={() => removeTag("industries", industries)}
                >
                  {industries} ✕
                </span>
              ))}
              <input
                type="text"
                value={tagInput.industries}
                onChange={(e) =>
                  setTagInput({ ...tagInput, industries: e.target.value })
                }
                onKeyDown={(e) => handleTagChange(e, "industries")}
                className="border-none outline-none flex-grow"
                placeholder="Type a industries and press Enter..."
              />
            </div>

            {/* Recommended industries dropdown */}
            {tagInput.industries &&
              filteredRecommendations.industries.length > 0 && (
                <div className="border rounded-md mt-2 p-2 bg-white shadow-md max-h-40 overflow-y-auto">
                  {filteredRecommendations.industries.map(
                    (industries, index) => (
                      <div
                        key={index}
                        className="p-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            industries: [...prev.industries, industries],
                          }));
                          setTagInput({ ...tagInput, industries: "" });
                        }}
                      >
                        {industries}
                      </div>
                    )
                  )}
                </div>
              )}
          </div>

          {/* Languages Input */}
          <div>
            <label className="block">
              Languages <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[40px]">
              {formData.languages.map((language, index) => (
                <span
                  key={index}
                  className="bg-green-200 text-green-800 px-2 py-1 rounded-md text-sm cursor-pointer"
                  onClick={() => removeTag("languages", language)}
                >
                  {language} ✕
                </span>
              ))}
              <input
                type="text"
                value={tagInput.languages}
                onChange={(e) =>
                  setTagInput({ ...tagInput, languages: e.target.value })
                }
                onKeyDown={(e) => handleTagChange(e, "languages")}
                className="border-none outline-none flex-grow"
                placeholder="Type a language and press Enter..."
              />
            </div>

            {/* Recommended languages dropdown */}
            {tagInput.languages &&
              filteredRecommendations.languages.length > 0 && (
                <div className="border rounded-md mt-2 p-2 bg-white shadow-md max-h-40 overflow-y-auto">
                  {filteredRecommendations.languages.map((language, index) => (
                    <div
                      key={index}
                      className="p-1 cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          languages: [...prev.languages, language],
                        }));
                        setTagInput({ ...tagInput, languages: "" });
                      }}
                    >
                      {language}
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div>
            <label className="block">
              Rate
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              name="rate"
            />
          </div>
        </>
      )}

      {/* Step 2: Project Portfolio */}
      {step === 1 &&
        formData.projectPortfolio?.map((portfolio, index) => (
          <div key={index} className="border p-4 rounded-md mb-2">
            <div>
              <label className="block">
                Project Title
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={portfolio.projectTitle}
                name="projectTitle"
                onChange={(e) =>
                  handleObjectArrayChange(
                    "projectPortfolio",
                    index,
                    e.target.name,
                    e.target.value
                  )
                }
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block">
                Project Description
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={portfolio.projectDescription}
                name="projectDescription"
                onChange={(e) =>
                  handleObjectArrayChange(
                    "projectPortfolio",
                    index,
                    e.target.name,
                    e.target.value
                  )
                }
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block">
                Technology
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={portfolio.technologies.join(", ")}
                name="technologies"
                onChange={(e) =>
                  handleObjectArrayChange(
                    "projectPortfolio",
                    index,
                    e.target.name,
                    e.target.value
                  )
                }
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Files
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(index, e)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* File Preview */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Files
              </h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {files[index]?.map((file, fileIndex) => (
                  <div key={fileIndex} className="relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-20 object-cover rounded-md"
                      width={80}
                      height={80}
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveFile(index, fileIndex)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      {step === 1 && (
        <Button
          type="button"
          onClick={() =>
            handleAddItem("projectPortfolio", defaultPortfolioItem)
          }
          className=" px-4 py-2 mt-4"
        >
          Add Project
        </Button>
      )}

      {/* Similar structure for Work Experience and Education */}
      {step === 2 &&
        formData.workExperience?.map((work, index) => (
          <div key={index} className="border p-4 rounded-md mb-2">
            <div>
              <label className="block">
                Company
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={work.company}
                name="company"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "workExperience",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block">
                jobTitle
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={work.jobTitle}
                name="jobTitle"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "workExperience",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block">
                Start Date
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={work.startDate}
                name="startDate"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "workExperience",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block">End Date</label>
              <input
                type="date"
                value={work.endDate}
                name="endDate"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "workExperience",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>
        ))}

      {step === 2 && (
        <Button
          type="button"
          onClick={() =>
            handleAddItem("workExperience", defaultWorkExperienceItem)
          }
          className=" px-4 py-2 mt-4"
        >
          Add Work
        </Button>
      )}
      {/* Similar structure for  Education */}
      {step === 3 &&
        formData.education?.map((edu, index) => (
          <div key={index} className="border p-4 rounded-md mb-2">
            <div>
              <label className="block">
                Instituition
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={edu.institution}
                name="institution"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "education",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block">
                Degree
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={edu.degree}
                name="degree"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "education",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block">
                Start Date
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={edu.startDate}
                name="startDate"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "education",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block">End Date</label>
              <input
                type="date"
                value={edu.endDate}
                name="endDate"
                onChange={(e) => {
                  handleObjectArrayChange(
                    "education",
                    index,
                    e.target.name,
                    e.target.value
                  );
                }}
                className="w-full border rounded-md p-2"
              />
            </div>{" "}
          </div>
        ))}
      {step === 3 && (
        <Button
          type="button"
          onClick={() => handleAddItem("education", defaultEducationItem)}
          className={clsx("px-4 py-2 mt-4")}
        >
          Add Education
        </Button>
      )}

      <div className="flex justify-between mt-4">
        {step > 0 && (
          <Button type="button" onClick={() => setStep((prev) => prev - 1)}>
            Previous
          </Button>
        )}
        {step < stepTitles.length - 1 && (
          <Button type="button" onClick={() => setStep((prev) => prev + 1)}>
            Next
          </Button>
        )}
        {step === 3 && (
          <Button
            type="submit"
            className={clsx("bg-blue-500 text-white", {
              "cursor-not-allowed opacity-50 disabled": uploading,
            })}
          >
            Submit
          </Button>
        )}
      </div>
    </form>
  );
};

export default MultiStepForm;
