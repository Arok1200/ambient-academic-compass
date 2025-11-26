package ecse424.mcgill.ca.ambient_academic_campass;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "*")  // allows frontend requests from anywhere
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    // Get all events
    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Create a new event
    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent) {
        return eventRepository.findById(id)
            .map(event -> {
                event.setTitle(updatedEvent.getTitle());
                event.setStartTime(updatedEvent.getStartTime());
                event.setEndTime(updatedEvent.getEndTime());
                event.setCompleted(updatedEvent.isCompleted());
                return eventRepository.save(event);
            })
            .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    // Delete an event by ID
    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
    }
}
