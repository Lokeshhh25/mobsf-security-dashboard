import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type AnalysisJob = {
    id : Text;
    name : Text;
    fileType : Text;
    size : Nat;
    uploadedAt : Int;
    status : Text;
  };

  type AnalysisResult = {
    jobId : Text;
    overallScore : Nat;
    criticalCount : Nat;
    highCount : Nat;
    mediumCount : Nat;
    lowCount : Nat;
    threatScore : Nat;
    isMalicious : Bool;
    permissionsCount : Nat;
    vulnerabilitiesCount : Nat;
  };

  let jobs = Map.empty<Text, AnalysisJob>();
  let results = Map.empty<Text, AnalysisResult>();

  func generateAnalysisResult(job : AnalysisJob) : AnalysisResult {
    let score = 100 - ((job.name.size() + job.size) % 100);
    {
      jobId = job.id;
      overallScore = score;
      criticalCount = job.size % 5;
      highCount = job.size % 10;
      mediumCount = job.size % 15;
      lowCount = job.size % 20;
      threatScore = (job.size + job.name.size()) % 100;
      isMalicious = score < 50;
      permissionsCount = job.size % 8;
      vulnerabilitiesCount = job.size % 12;
    };
  };

  public shared ({ caller }) func uploadFile(name : Text, fileType : Text, size : Nat) : async AnalysisJob {
    let jobId = name.concat(Time.now().toText());
    let job : AnalysisJob = {
      id = jobId;
      name;
      fileType;
      size;
      uploadedAt = Time.now();
      status = "completed";
    };

    jobs.add(jobId, job);

    let result = generateAnalysisResult(job);
    results.add(jobId, result);

    job;
  };

  public query ({ caller }) func getAnalysisResults(jobId : Text) : async ?AnalysisResult {
    results.get(jobId);
  };

  public query ({ caller }) func listJobs() : async [AnalysisJob] {
    jobs.values().toArray();
  };

  public shared ({ caller }) func deleteJob(jobId : Text) : async Bool {
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Analysis job not found") };
      case (?_) {
        jobs.remove(jobId);
        results.remove(jobId);
        true;
      };
    };
  };
};
