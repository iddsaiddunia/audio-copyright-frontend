import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMusic, 
  FiUpload, 
  FiAlertCircle, 
  FiInfo,
  FiChevronLeft,
  FiCheck
} from 'react-icons/fi';

interface FormData {
  title: string;
  genre: string;
  releaseYear: string;
  description: string;
  lyrics: string;
  collaborators: string;
  isAvailableForLicensing: boolean;
  licenseFee: number;
  licenseTerms: string;
  audioFile: File | null;
  audioFileName: string;
}

const RegisterTrack: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    genre: '',
    releaseYear: new Date().getFullYear().toString(),
    description: '',
    lyrics: '',
    collaborators: '',
    isAvailableForLicensing: true,
    licenseFee: 25000, // Default license fee in TZS
    licenseTerms: 'Commercial use requires prior approval',
    audioFile: null,
    audioFileName: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData({
        ...formData,
        audioFile: file,
        audioFileName: file.name
      });
    }
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.genre.trim()) return 'Genre is required';
    if (!formData.releaseYear.trim()) return 'Release year is required';
    if (!formData.audioFile) return 'Audio file is required';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.lyrics.trim()) return 'Lyrics are required for copyright registration';
    return null;
  };

  const handleNextStep = () => {
    let validationError = null;
    
    if (currentStep === 1) {
      validationError = validateStep1();
    } else if (currentStep === 2) {
      validationError = validateStep2();
    }
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.audioFile) {
      setError('Audio file is required.');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('genre', formData.genre);
      formPayload.append('releaseYear', String(formData.releaseYear));
      if (formData.description) formPayload.append('description', formData.description);
      formPayload.append('lyrics', formData.lyrics);
      if (formData.collaborators) formPayload.append('collaborators', formData.collaborators);
      formPayload.append('isAvailableForLicensing', String(formData.isAvailableForLicensing));
      formPayload.append('licenseFee', String(formData.licenseFee));
      formPayload.append('licenseTerms', formData.licenseTerms);
      formPayload.append('audio', formData.audioFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/tracks/upload`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formPayload,
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Track upload failed.');
        setIsLoading(false);
        return;
      }
      navigate('/artist/track-submitted');
    } catch (err: any) {
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred during submission. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-cosota text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {currentStep > 1 ? <FiCheck className="w-5 h-5" /> : 1}
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Track Details
            </div>
          </div>
          
          <div className="w-full mx-4 h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-1 bg-cosota transition-all duration-300`} 
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
          </div>
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-cosota text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {currentStep > 2 ? <FiCheck className="w-5 h-5" /> : 2}
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Lyrics & Rights
            </div>
          </div>
          
          <div className="w-full mx-4 h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-1 bg-cosota transition-all duration-300`} 
              style={{ width: `${(currentStep - 2) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 3 ? 'bg-cosota text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              3
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Payment & Submit
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Track Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Genre *
            </label>
            <select
              id="genre"
              name="genre"
              required
              value={formData.genre}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a genre</option>
              <option value="Bongo Flava">Bongo Flava</option>
              <option value="Taarab">Taarab</option>
              <option value="Afrobeat">Afrobeat</option>
              <option value="Gospel">Gospel</option>
              <option value="Traditional">Traditional</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="R&B">R&B</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Release Year *
            </label>
            <input
              id="releaseYear"
              name="releaseYear"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              required
              value={formData.releaseYear}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Briefly describe your track..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Audio File *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
            <div className="space-y-1 text-center">
              <FiMusic className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="audioFile"
                  className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="audioFile"
                    name="audioFile"
                    type="file"
                    accept="audio/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                MP3, WAV, FLAC up to 20MB
              </p>
              {formData.audioFileName && (
                <p className="text-sm text-cosota dark:text-cosota-light">
                  Selected: {formData.audioFileName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lyrics *
          </label>
          <textarea
            id="lyrics"
            name="lyrics"
            rows={10}
            required
            value={formData.lyrics}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter the full lyrics of your song..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Complete lyrics are required for copyright registration.
          </p>
        </div>

        <div>
          <label htmlFor="collaborators" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Collaborators
          </label>
          <textarea
            id="collaborators"
            name="collaborators"
            rows={3}
            value={formData.collaborators}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="List any co-writers, producers, or featured artists..."
          />
        </div>

        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Licensing Information</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  Making your work available for licensing allows others to request permission to use it.
                  You'll have full control over approving or rejecting each request.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isAvailableForLicensing"
              name="isAvailableForLicensing"
              type="checkbox"
              checked={formData.isAvailableForLicensing}
              onChange={handleInputChange}
              className="focus:ring-cosota h-4 w-4 text-cosota border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isAvailableForLicensing" className="font-medium text-gray-700 dark:text-gray-300">
              Make this work available for licensing
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Others can request to use this work commercially. You'll review each request.
            </p>
          </div>
        </div>
        
        {formData.isAvailableForLicensing && (
          <div className="mt-4 pl-7 space-y-4 border-l-2 border-cosota-light/30 dark:border-cosota/30">
            <div>
              <label htmlFor="licenseFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License Fee (TZS)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="licenseFee"
                  id="licenseFee"
                  min="0"
                  value={formData.licenseFee}
                  onChange={handleInputChange}
                  className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                  placeholder="Enter license fee amount"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This is the fee you'd like to charge for commercial use of your work. COSOTA will deduct a commission from this amount.
              </p>
            </div>
            
            <div>
              <label htmlFor="licenseTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License Terms
              </label>
              <textarea
                id="licenseTerms"
                name="licenseTerms"
                rows={3}
                value={formData.licenseTerms}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe any specific terms or restrictions for licensing your work..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Specify any restrictions or conditions for using your work (e.g., "No political use", "Credit required").
              </p>
            </div>
            
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiInfo className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    COSOTA will deduct a commission from each license fee. You'll receive detailed breakdowns for each license request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Registration Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Track Title:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Genre:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.genre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Release Year:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.releaseYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Audio File:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.audioFileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Available for Licensing:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.isAvailableForLicensing ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white">Registration Fee</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Non-refundable fee for copyright registration</p>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TZS 25,000</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <FiUpload className="-ml-1 mr-2 h-4 w-4" />
                Submit for Copyright Registration
              </>
            )}
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            By submitting this form, you confirm that you are the rightful owner of this work and that all information provided is accurate.
            COSOTA officials will review your submission before granting copyright registration.
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/artist')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FiChevronLeft className="-ml-1 mr-1 h-5 w-5" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register New Track</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Submit your musical work for copyright registration with COSOTA
          </p>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          {renderProgressBar()}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md flex items-start">
              <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            {currentStep < 3 && (
              <div className="mt-8 flex justify-end">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
                >
                  Next
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterTrack;
