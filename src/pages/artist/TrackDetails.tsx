import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMusic, 
  FiClock, 
  FiFileText, 
  FiLock, 
  FiEdit2, 
  FiDownload,
  FiChevronLeft,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  genre: string;
  releaseYear: string;
  description: string;
  lyrics: string;
  collaborators: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  blockchainTxHash?: string;
  isAvailableForLicensing: boolean;
  audioFileName: string;
  licenseFee?: number;
  licenseTerms?: string;
  licenseCount?: number;
  cosotaCommissionPercentage?: number;
}

const TrackDetails: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would be an API call to fetch the track details
    // For demo purposes, we'll use mock data
    const fetchTrack = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on trackId
        if (trackId === '1') {
          setTrack({
            id: '1',
            title: 'Serengeti Sunset',
            genre: 'Bongo Flava',
            releaseYear: '2025',
            description: 'A song inspired by the beautiful sunsets of the Serengeti plains.',
            licenseFee: 75000,
            licenseTerms: 'Commercial use requires proper attribution',
            licenseCount: 2,
            cosotaCommissionPercentage: 15,
            lyrics: `Verse 1:
Golden rays paint the savanna sky
As day surrenders to the night
Acacia trees stand silhouetted tall
While nature's symphony begins to call

Chorus:
Serengeti sunset, colors fill my soul
Orange, red, and purple hues take control
Serengeti sunset, beauty beyond compare
In this moment, I find peace so rare

Verse 2:
Lions roar in the distance wide
As darkness slowly comes to hide
The day's memories in shadows deep
While stars above begin to peep

[Chorus]

Bridge:
In this land of ancient dreams
Where life and death play out their schemes
I find myself, I lose myself
In nature's perfect wealth

[Chorus]

Outro:
Serengeti sunset, forever in my heart
A perfect ending, a perfect start`,
            collaborators: 'Produced by John Doe, Co-written with Jane Smith',
            status: 'approved',
            submittedAt: '2025-05-15T10:30:00Z',
            approvedAt: '2025-05-18T14:45:00Z',
            isAvailableForLicensing: true,
            audioFileName: 'serengeti_sunset.mp3'
          });
        } else if (trackId === '2') {
          setTrack({
            id: '2',
            title: 'Zanzibar Nights',
            genre: 'Afrobeat',
            releaseYear: '2024',
            description: 'A celebration of the vibrant nightlife in Stone Town, Zanzibar.',
            licenseFee: 50000,
            licenseTerms: 'No political use, credit required',
            licenseCount: 5,
            cosotaCommissionPercentage: 15,
            lyrics: `Verse 1:
Stone Town alleys come alive
As the sun begins to dive
Spice markets close their doors
While music rises from the shores

Chorus:
Zanzibar nights, dancing under stars
Zanzibar nights, rhythm of our hearts
Zanzibar nights, where cultures blend as one
The magic's only just begun

Verse 2:
Ocean breeze carries the sound
Of taarab music all around
Hands clapping, voices high
Beneath the velvet island sky

[Chorus]

Bridge:
History whispers through these streets
Where different worlds and cultures meet
In harmony we find our way
As night transforms another day

[Chorus]

Outro:
Zanzibar nights, memories we'll keep
Long after the island falls asleep`,
            collaborators: 'Featuring vocals by Maria Joseph',
            status: 'copyrighted',
            submittedAt: '2025-05-10T14:20:00Z',
            approvedAt: '2025-05-12T09:30:00Z',
            blockchainTxHash: '0x7d8f3e2c1a5b9d6f4c2e8a7b3d5f2e1c9b8a7d6f3e2c1a5b9d6f4c2e8a7b3d5f',
            isAvailableForLicensing: true,
            audioFileName: 'zanzibar_nights.mp3'
          });
        } else if (trackId === '3') {
          setTrack({
            id: '3',
            title: 'Kilimanjaro Dreams',
            genre: 'Taarab',
            releaseYear: '2025',
            description: 'A musical journey inspired by climbing Mount Kilimanjaro.',
            lyrics: `Verse 1:
Standing at the base, looking up so high
Africa's rooftop touching the sky
The journey ahead seems so steep
But dreams of the summit I keep

Chorus:
Kilimanjaro dreams, calling me to climb
Kilimanjaro dreams, one step at a time
Through forest and alpine, to glaciers above
This mountain captures my heart and my love

Verse 2:
Breathless and weary, I continue on
From midnight till the break of dawn
Stars guide my path through the night
Until I reach the morning light

[Chorus]

Bridge:
Uhuru Peak in the distance gleams
The culmination of all my dreams
The struggle and pain fade away
As I greet the new day

[Chorus]

Outro:
Kilimanjaro dreams, now reality
The roof of Africa, has changed me`,
            collaborators: 'Percussion by Robert Mbuki',
            status: 'pending',
            submittedAt: '2025-05-20T09:15:00Z',
            isAvailableForLicensing: false,
            audioFileName: 'kilimanjaro_dreams.mp3'
          });
        } else if (trackId === '4') {
          setTrack({
            id: '4',
            title: 'Dar es Salaam Groove',
            genre: 'Hip Hop',
            releaseYear: '2023',
            description: 'An urban anthem celebrating life in Tanzania\'s largest city.',
            lyrics: `Verse 1:
City lights reflecting in the harbor bay
Hustle and bustle of another day
From Kariakoo to Oyster Bay
Dar es Salaam has something to say

Chorus:
Dar es Salaam groove, feel the city's beat
Dar es Salaam groove, life is bittersweet
From sunrise to sunset, we're on our feet
In this concrete jungle where all cultures meet

Verse 2:
Daladalas weaving through the crowded streets
While vendors sell their wares in the midday heat
Languages blend in a beautiful sound
As people from all walks of life gather around

[Chorus]

Bridge:
City of Peace, that's what they call you
A melting pot of old and new
Despite the challenges that we face
You move forward at your own pace

[Chorus]

Outro:
Dar es Salaam groove, in my heart you stay
No matter how far I roam away`,
            collaborators: 'Featuring local street musicians',
            status: 'rejected',
            submittedAt: '2025-05-05T11:45:00Z',
            rejectionReason: 'Insufficient documentation of ownership. Please provide proof that you are the original creator of this work.',
            isAvailableForLicensing: false,
            audioFileName: 'dar_es_salaam_groove.mp3'
          });
        } else {
          setError('Track not found');
        }
      } catch (err) {
        setError('Failed to load track details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrack();
  }, [trackId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusInfo = () => {
    if (!track) return null;
    
    switch (track.status) {
      case 'pending':
        return {
          icon: <FiClock className="h-5 w-5 text-yellow-500" />,
          label: 'Pending Approval',
          description: 'Your track is currently under review by COSOTA officials.',
          color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
        };
      case 'approved':
        return {
          icon: <FiCheck className="h-5 w-5 text-green-500" />,
          label: 'Approved',
          description: `Your copyright was approved on ${formatDate(track.approvedAt)}. It will be published to the blockchain soon.`,
          color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
        };
      case 'rejected':
        return {
          icon: <FiX className="h-5 w-5 text-red-500" />,
          label: 'Rejected',
          description: track.rejectionReason || 'Your copyright application was rejected.',
          color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        };
      case 'copyrighted':
        return {
          icon: <FiLock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />,
          label: 'Copyrighted',
          description: 'Your track has been fully copyrighted and is legally protected.',
          color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400'
        };
      default:
        return {
          icon: <FiAlertTriangle className="h-5 w-5 text-gray-500" />,
          label: 'Unknown Status',
          description: 'The status of your track is unknown.',
          color: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-10 w-10 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="text-center py-10">
        <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{error || 'Track not found'}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          We couldn't find the track you're looking for.
        </p>
        <div className="mt-6">
          <Link
            to="/artist/my-tracks"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            <FiChevronLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to My Tracks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/artist/my-tracks')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FiChevronLeft className="-ml-1 mr-1 h-5 w-5" />
          Back to My Tracks
        </button>
      </div>

      {/* Track Header */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10 mr-4">
              <FiMusic className="h-8 w-8 text-cosota" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{track.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {track.genre} • {track.releaseYear}
              </p>
            </div>
          </div>
          
          {track.status === 'rejected' && (
            <Link
              to={`/artist/register-track?edit=${track.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
            >
              <FiEdit2 className="-ml-0.5 mr-2 h-4 w-4" />
              Edit & Resubmit
            </Link>
          )}
        </div>
        
        {/* Status Banner */}
        {statusInfo && (
          <div className={`px-4 py-3 ${statusInfo.color} flex items-start`}>
            <div className="flex-shrink-0">
              {statusInfo.icon}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">{statusInfo.label}</h3>
              <div className="mt-1 text-sm">
                <p>{statusInfo.description}</p>
                
                {track.status === 'copyrighted' && track.blockchainTxHash && (
                  <div className="mt-1">
                    <span className="font-medium">Transaction Hash: </span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                      {track.blockchainTxHash}
                    </code>
                  </div>
                )}
                
                {track.status === 'copyrighted' && (
                  <div className="mt-3">
                    <Link
                      to={`/artist/transfer-ownership/${track.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <FiRefreshCw className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
                      Transfer Ownership
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Track Details */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Track Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Copyright information and track metadata
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{track.title}</dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Genre</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{track.genre}</dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Release Year</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{track.releaseYear}</dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{track.description}</dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Collaborators</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {track.collaborators || 'None'}
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Licensing</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div className="space-y-2">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      track.isAvailableForLicensing 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {track.isAvailableForLicensing ? 'Available for Licensing' : 'Not Available for Licensing'}
                    </span>
                  </div>
                  
                  {track.isAvailableForLicensing && (
                    <div className="space-y-2">
                      {track.licenseFee !== undefined && (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">License Fee:</span>
                            <span>{track.licenseFee.toLocaleString()} TZS</span>
                          </div>
                          
                          {track.cosotaCommissionPercentage !== undefined && (
                            <div className="pl-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                              <div className="flex justify-between">
                                <span>COSOTA Commission ({track.cosotaCommissionPercentage}%):</span>
                                <span>{Math.round(track.licenseFee * (track.cosotaCommissionPercentage / 100)).toLocaleString()} TZS</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Artist Payment:</span>
                                <span>{Math.round(track.licenseFee * (1 - track.cosotaCommissionPercentage / 100)).toLocaleString()} TZS</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {track.licenseTerms && (
                        <div>
                          <span className="font-medium">License Terms:</span>
                          <p className="mt-1 text-sm">{track.licenseTerms}</p>
                        </div>
                      )}
                      
                      {track.licenseCount !== undefined && track.licenseCount > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                            {track.licenseCount} active license{track.licenseCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Submission Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {formatDate(track.submittedAt)}
              </dd>
            </div>
            {track.status === 'approved' && track.approvedAt && (
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Approval Date</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {formatDate(track.approvedAt)}
                </dd>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Audio File</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <span className="mr-2">{track.audioFileName}</span>
                  <button
                    type="button"
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    <FiDownload className="-ml-0.5 mr-1 h-4 w-4" />
                    Download
                  </button>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Lyrics Section */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Lyrics</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Complete lyrics as submitted for copyright
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLyrics(!showLyrics)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <FiFileText className="-ml-0.5 mr-2 h-4 w-4" />
            {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
          </button>
        </div>
        
        {showLyrics && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans">
              {track.lyrics}
            </pre>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end">
        {track.status === 'rejected' && (
          <Link
            to={`/artist/register-track?edit=${track.id}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            <FiEdit2 className="-ml-1 mr-2 h-4 w-4" />
            Edit & Resubmit
          </Link>
        )}
        
        {(track.status === 'approved' || track.status === 'copyrighted') && (
          <>
            <button
              onClick={() => {
                // In a real app, this would call an API to generate and download the certificate
                alert('Certificate download started. This would be a real PDF in production.');
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-800"
            >
              <FiDownload className="-ml-1 mr-2 h-4 w-4" />
              Download Certificate
            </button>
            
            <Link
              to="/artist/my-licenses"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              View License Requests
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TrackDetails;
