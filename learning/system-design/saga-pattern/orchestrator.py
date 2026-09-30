import json
import logging
from datetime import datetime
import os

logger = logging.getLogger('orchestrator')

class SagaOrchestrator:
    def __init__(self):
        self.steps = []
        self.log_file = "saga_execution.json"
        
    def add_step(self, execute_fn, compensate_fn, kwargs):
        self.steps.append({
            "execute_fn": execute_fn,
            "compensate_fn": compensate_fn,
            "kwargs": kwargs
        })

    def run(self):
        completed_stack = []
        saga_logs = []
        
        def _log_event(action, step_name, status, error=None):
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "action": action,
                "step": step_name,
                "status": status
            }
            if error:
                log_entry["error"] = str(error)
            saga_logs.append(log_entry)
            
            # Write to JSON file
            mode = 'a' if os.path.exists(self.log_file) else 'w'
            with open(self.log_file, mode) as f:
                json.dump(log_entry, f)
                f.write('\n')
        
        for step in self.steps:
            execute_fn = step["execute_fn"]
            compensate_fn = step["compensate_fn"]
            kwargs = step["kwargs"]
            step_name = execute_fn.__name__
            
            try:
                execute_fn(**kwargs)
                completed_stack.append(step)
                _log_event("EXECUTE", step_name, "SUCCESS")
            except Exception as e:
                logger.error(f"Step {step_name} failed: {e}")
                _log_event("EXECUTE", step_name, "FAILED", error=e)
                logger.info(f"Starting compensation for {len(completed_stack)} completed steps...")
                
                # Rollback in reverse order
                while completed_stack:
                    comp_step = completed_stack.pop()
                    comp_fn = comp_step["compensate_fn"]
                    comp_kwargs = comp_step["kwargs"]
                    comp_name = comp_fn.__name__
                    
                    try:
                        comp_fn(**comp_kwargs)
                        _log_event("COMPENSATE", comp_name, "SUCCESS")
                    except Exception as comp_e:
                        logger.error(f"Compensation step {comp_name} failed: {comp_e}")
                        _log_event("COMPENSATE", comp_name, "FAILED", error=comp_e)
                
                return False, str(e)
                
        return True, "Saga completed successfully"
