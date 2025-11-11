package ecse424.mcgill.ca.ambient_academic_campass;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/deadlines")
@CrossOrigin(origins = "*")  // allows frontend requests from anywhere
public class DeadlineController {

    @Autowired
    private DeadlineRepository deadlineRepository;

    @GetMapping
    public List<Deadline> getAllDeadlines() {
        return deadlineRepository.findAll();
    }

    @PostMapping
    public Deadline createDeadline(@RequestBody Deadline deadline) {
        return deadlineRepository.save(deadline);
    }

    @DeleteMapping("/{id}")
    public void deleteDeadline(@PathVariable Long id) {
        deadlineRepository.deleteById(id);
    }
}
