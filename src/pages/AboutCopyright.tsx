import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiShield, FiDatabase, FiFileText, FiUsers, FiGlobe } from 'react-icons/fi';

// Info card component
interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon }) => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-all duration-300">
    <div className="p-5">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-cosota-light rounded-md p-3 text-white">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

const AboutCopyright: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">About Copyright</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Learn about copyright laws, COSOTA's role, and how our blockchain system works
        </p>
      </div>

      {/* Introduction Section */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            Copyright Society of Tanzania (COSOTA)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The Copyright Society of Tanzania (COSOTA) is a collective management organization 
            established under the Copyright and Neighbouring Rights Act of Tanzania. COSOTA is 
            responsible for protecting the rights of authors, composers, and other copyright 
            holders in Tanzania.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Our mission is to ensure that creators receive fair compensation for their work and 
            that their intellectual property rights are protected. Through this digital platform, 
            we aim to streamline the copyright registration process, enhance verification capabilities, 
            and provide transparent management of copyright information using blockchain technology.
          </p>
        </div>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <InfoCard
          title="Copyright Duration"
          description="In Tanzania, copyright protection lasts for 50 years after the creation of the work or the death of the author, depending on the type of work. After this period, the work enters the public domain."
          icon={<FiClock className="h-6 w-6" />}
        />
        <InfoCard
          title="Protection Scope"
          description="Copyright protection covers original literary, musical, artistic, and audiovisual works, including songs, music compositions, sound recordings, and performances."
          icon={<FiShield className="h-6 w-6" />}
        />
        <InfoCard
          title="Blockchain Security"
          description="Our system uses blockchain technology to create immutable records of copyright registrations, ensuring transparency, security, and easy verification of ownership."
          icon={<FiDatabase className="h-6 w-6" />}
        />
        <InfoCard
          title="Registration Process"
          description="Artists must register their works with COSOTA to receive official copyright protection. The process includes verification, payment of fees, and approval by COSOTA officials."
          icon={<FiFileText className="h-6 w-6" />}
        />
        <InfoCard
          title="Licensing & Transfers"
          description="Copyright owners can grant licenses for others to use their work or transfer ownership entirely. All transactions are managed through COSOTA and recorded on the blockchain."
          icon={<FiUsers className="h-6 w-6" />}
        />
        <InfoCard
          title="International Protection"
          description="Tanzania is a signatory to international copyright treaties, ensuring that works registered with COSOTA receive protection in other member countries."
          icon={<FiGlobe className="h-6 w-6" />}
        />
      </div>

      {/* Blockchain Explanation */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            Blockchain Technology in Copyright Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our system leverages blockchain technology to create a secure, transparent, and immutable 
            record of copyright registrations. Each copyright entry is stored as a transaction on the 
            blockchain, making it virtually impossible to alter or tamper with the record.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Key benefits of our blockchain implementation include:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>
              <span className="font-medium">Immutability:</span> Once a copyright is registered on the blockchain, 
              the record cannot be altered or deleted, providing a permanent proof of ownership.
            </li>
            <li>
              <span className="font-medium">Transparency:</span> All copyright information is publicly verifiable, 
              allowing anyone to check the ownership status of a work.
            </li>
            <li>
              <span className="font-medium">Security:</span> The decentralized nature of blockchain makes it 
              highly resistant to fraud and unauthorized modifications.
            </li>
            <li>
              <span className="font-medium">Efficiency:</span> Smart contracts automate certain aspects of 
              copyright management, reducing administrative overhead and processing times.
            </li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400">
            All blockchain transactions are initiated and approved by COSOTA officials, ensuring that 
            the system maintains the necessary human oversight while benefiting from the security 
            advantages of blockchain technology.
          </p>
        </div>
      </div>

      {/* Copyright Registration Steps */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            Copyright Registration Process
          </h2>
          <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
            <li className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-cosota rounded-full -left-4 ring-4 ring-white dark:ring-gray-800 text-white">
                1
              </span>
              <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                Artist Registration
              </h3>
              <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                Artists create an account and submit identification documents for verification by COSOTA officials.
                Upon approval, an Ethereum wallet address is generated for the artist.
              </p>
            </li>
            <li className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-cosota rounded-full -left-4 ring-4 ring-white dark:ring-gray-800 text-white">
                2
              </span>
              <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                Track Submission
              </h3>
              <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                Verified artists upload their audio tracks along with metadata such as title, 
                composer information, and release date. The system automatically generates an audio fingerprint.
              </p>
            </li>
            <li className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-cosota rounded-full -left-4 ring-4 ring-white dark:ring-gray-800 text-white">
                3
              </span>
              <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                Fee Payment
              </h3>
              <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                Artists pay a non-refundable registration fee to submit their copyright application for review.
              </p>
            </li>
            <li className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-cosota rounded-full -left-4 ring-4 ring-white dark:ring-gray-800 text-white">
                4
              </span>
              <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                COSOTA Review
              </h3>
              <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                COSOTA officials review the submission, check for potential copyright conflicts,
                and make a decision to approve or reject the application.
              </p>
            </li>
            <li className="ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-cosota rounded-full -left-4 ring-4 ring-white dark:ring-gray-800 text-white">
                5
              </span>
              <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                Blockchain Publication
              </h3>
              <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                Upon approval, COSOTA officials publish the copyright information to the blockchain,
                creating a permanent and verifiable record of ownership with a 50-year validity period.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutCopyright;
