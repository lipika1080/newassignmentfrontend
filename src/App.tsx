// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  Box, Heading, Text, Button,
  Input, FormControl, FormLabel,
  Stack, VStack, HStack, Divider, Select
} from "@chakra-ui/react";
import {
  Assignment, Submission,
  createAssignment, fetchAssignments,
  submitAssignment, sendReminder
} from "./api";

export default function App() {
  // State
  const [assigns, setAssigns] = useState<Assignment[]>([]);
  const [newAsg, setNewAsg] = useState({ title: "", description: "", deadline: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sub, setSub] = useState<Submission>({
    student_name: "",
    submission_link: "",
    submitted_at: ""
  });

  // Reminder state
  const [windowHours, setWindowHours] = useState<number>(24);
  const [sending, setSending] = useState(false);

  // Fetch on load
  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    fetchAssignments().then(res => setAssigns(res.data));
  };

  // Create new assignment
  const handleCreate = async () => {
    await createAssignment(newAsg);
    setNewAsg({ title: "", description: "", deadline: "" });
    refresh();
  };

  // Select assignment to submit
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSub({ student_name: "", submission_link: "", submitted_at: "" });
  };

  // Submit assignment
  const handleSubmit = async () => {
    if (selectedId) {
      await submitAssignment(selectedId, sub);
      setSelectedId(null);
      refresh();
    }
  };

  // Send reminders for upcoming deadlines
  // inside your App component, replace handleSendReminders with this

const handleSendReminders = async () => {
  setSending(true);

  const now = Date.now();
  const cutoff = now + windowHours * 60 * 60 * 1000;

  console.log("🏷 All deadlines:", assigns.map(a => a.deadline));
  console.log("⏱ Now:", new Date(now).toISOString());
  console.log("✂️ Cutoff:", new Date(cutoff).toISOString());

  // Build list of upcoming
  const upcoming = assigns.filter(a => {
    const dlMs = Date.parse(a.deadline);       // parse ISO string
    if (isNaN(dlMs)) {
      console.warn("Invalid date for assignment", a);
      return false;
    }
    return dlMs > now && dlMs <= cutoff;
  });

  console.log("📨 Upcoming to remind:", upcoming);

  // Now actually send
  for (const a of upcoming) {
    await sendReminder({
      to_email: "08.ajeet@gmail.com",           // hook up real emails later
      subject: `Reminder: "${a.title}" due soon`,
      content:   `Your assignment "${a.title}" is due at ${a.deadline}.`
    });
  }

  alert(`Sent reminders for ${upcoming.length} assignment(s).`);
  setSending(false);
};


  return (
    <Box p={6} maxW="800px" mx="auto">

      <Heading mb={4}>Student Assignment Submission</Heading>

      {/* Reminder Panel */}
      <Box p={4} mb={6} borderWidth={1} borderRadius="md" bg="orange.50">
        <Heading size="md" mb={3}>Send Reminder Emails</Heading>
        <Text mb={2}>
          Remind students whose assignments are due within the next:
        </Text>
        <HStack spacing={3}>
          <Select
            w="120px"
            value={windowHours}
            onChange={e => setWindowHours(Number(e.target.value))}
          >
            {[1, 6, 12, 24, 48].map(h => (
              <option key={h} value={h}>{h} hours</option>
            ))}
          </Select>
          <Button
            colorScheme="orange"
            isLoading={sending}
            onClick={handleSendReminders}
          >
            Send Reminders
          </Button>
        </HStack>
      </Box>

      <Divider mb={6} />

      {/* Teacher Panel */}
      <Box p={4} mb={6} borderWidth={1} borderRadius="md">
        <Heading size="md" mb={3}>Post New Assignment</Heading>
        <Stack spacing={3}>
          {(["title","description","deadline"] as const).map(f => (
            <FormControl key={f}>
              <FormLabel>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </FormLabel>
              <Input
                value={(newAsg as any)[f]}
                onChange={e =>
                  setNewAsg({ ...newAsg, [f]: e.target.value })
                }
                placeholder={
                  f === "deadline"
                    ? "YYYY-MM-DDTHH:mm:ssZ"
                    : undefined
                }
              />
            </FormControl>
          ))}
          <Button colorScheme="teal" onClick={handleCreate}>
            Create Assignment
          </Button>
        </Stack>
      </Box>

      {/* Assignments List */}
      <Heading size="md" mb={3}>Available Assignments</Heading>
      <VStack spacing={4} align="stretch" mb={6}>
        {assigns.map(a => (
          <Box key={a._id} p={4} borderWidth={1} borderRadius="md">
            <HStack justify="space-between">
              <Box>
                <Heading size="sm">{a.title}</Heading>
                <Text>{a.description}</Text>
                <Text fontSize="sm" color="gray.600">
                  Deadline: {a.deadline}
                </Text>
                <Text fontSize="sm" mt={2}>
                  Submissions: {a.submissions.length}
                </Text>
              </Box>
              <Button
                size="sm"
                colorScheme={selectedId === a._id ? "green" : "blue"}
                onClick={() => handleSelect(a._id)}
              >
                {selectedId === a._id ? "Selected" : "Select"}
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* Student Submission Form */}
      {selectedId && (
        <Box p={4} borderWidth={1} borderRadius="md">
          <Heading size="md" mb={3}>Submit Your Work</Heading>
          <Stack spacing={3}>
            {(
              ["student_name","submission_link","submitted_at"] as const
            ).map(f => (
              <FormControl key={f}>
                <FormLabel>
                  {f.replace("_", " ").toUpperCase()}
                </FormLabel>
                <Input
                  value={(sub as any)[f]}
                  onChange={e =>
                    setSub({ ...sub, [f]: e.target.value })
                  }
                  placeholder={
                    f === "submitted_at"
                      ? "YYYY-MM-DDTHH:mm:ssZ"
                      : undefined
                  }
                />
              </FormControl>
            ))}
            <HStack spacing={3}>
              <Button colorScheme="teal" onClick={handleSubmit}>
                Submit Assignment
              </Button>
              <Button variant="outline" onClick={()=>setSelectedId(null)}>
                Cancel
              </Button>
            </HStack>
          </Stack>
        </Box>
      )}

    </Box>
  );
}
