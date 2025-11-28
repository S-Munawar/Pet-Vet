/**
 * Health Records Retrieval Examples
 * Use these queries to fetch and display analysis history
 * 
 * NOTE: These are example implementations. Use these patterns in your own controller files.
 */

// Example 1: Get all health analyses for a specific pet
// Query: CommonHealthRecord.find({ pet_id: petId }).sort({ visitDate: -1 })
// Returns array of health records with species-specific details populated

// Example 2: Get a specific health record with all details
// const commonRecord = await CommonHealthRecord.findById(commonRecordId)
//   .populate('pet_id', 'name species breed dateOfBirth')
//   .populate('created_by', 'name email');
// const speciesRecord = await CatHealthRecord.findById(commonRecord.species_health_record_id);

// Example 3: Get health trends for a pet
// Find all CommonHealthRecords for pet, then extract vitals timeline
// Track temperature, heart rate, respiratory rate changes over time

// Example 4: Count analyses by health status
// Aggregate DogHealthRecord or CatHealthRecord by diagnosis field
// Group and count to see distribution of health outcomes

// Example 5: Search analyses by diagnosis keywords
// CommonHealthRecord.find({ 
//   diagnosis: { $regex: keyword, $options: 'i' },
//   pet_id: petId 
// })

// Example 6: Get recent analyses across all pets
// CommonHealthRecord.find({}).sort({ visitDate: -1 }).limit(10)

// Example 7: Get all pets analyzed by a specific vet
// CommonHealthRecord.find({ vet_id: vetId }).populate('pet_id')

export const healthRecordsQueries = {
  /**
   * Get all analyses for a pet
   * @param petId MongoDB ObjectId of the pet
   * @returns Array of health records sorted by date (newest first)
   */
  getPetAnalysisHistory: async (petId: string) => {
    // Implementation: Use CommonHealthRecord.find({ pet_id: petId })
    // Then populate species_health_record_id to get detailed health data
  },

  /**
   * Get detailed view of a single health record
   * @param commonRecordId MongoDB ObjectId of the common health record
   * @returns Full health record with pet info, vitals, diagnosis, treatment, etc.
   */
  getHealthRecordDetails: async (commonRecordId: string) => {
    // Implementation: Fetch CommonHealthRecord by ID
    // Then fetch corresponding CatHealthRecord or DogHealthRecord
    // Combine for complete health assessment
  },

  /**
   * Get health trends/timeline for a pet
   * @param petId MongoDB ObjectId of the pet
   * @returns Vitals timeline and diagnosis history
   */
  getPetHealthTrends: async (petId: string) => {
    // Implementation: Find all records for pet
    // Extract vitals arrays: temperature, HR, RR, weight over time
    // Extract diagnosis changes over time
    // Useful for charting health improvements/decline
  },

  /**
   * Search analyses by diagnosis
   * @param keyword Search term
   * @param petId Optional pet ID to filter
   * @returns Analyses matching diagnosis keyword
   */
  searchAnalysisByDiagnosis: async (keyword: string, petId?: string) => {
    // Implementation: CommonHealthRecord.find({ diagnosis: { $regex } })
    // Optional: Filter by petId
    // Useful for finding related health conditions
  },

  /**
   * Get recent analyses system-wide
   * @param limit Number of records to return
   * @returns Latest N health analyses across all pets
   */
  getRecentAnalyses: async (limit: number = 10) => {
    // Implementation: CommonHealthRecord.find({}).sort({ visitDate: -1 }).limit()
    // Populate pet info for context
  },

  /**
   * Get all pets analyzed by a vet
   * @param vetId MongoDB ObjectId of the vet
   * @returns List of pets with analysis counts and last analysis date
   */
  getVetAnalyzedPets: async (vetId: string) => {
    // Implementation: CommonHealthRecord.find({ vet_id: vetId }).populate('pet_id')
    // Group by pet_id to get unique pets and count analyses per pet
  },
};

