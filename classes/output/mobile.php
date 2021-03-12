<?php 

namespace format_thinkmodulartopics\output;
 
use context_module;
use format_thinkmodulartopics_external;


class mobile {
 
    /**
    * Main course page.
    *
    * @param array $args Standard mobile web service arguments
    * @return array
    */
    public static function mobile_course_view($args) {
        global $OUTPUT, $CFG, $DB, $USER;
        require_once($CFG->libdir.'/completionlib.php');

        $course = get_course($args['courseid']);
        require_login($course);
        #$angularTemplate = file_get_contents($CFG->dirroot . '/course/format/thinkmodulartopics/templates/mobile_course.html');
        $data = array();

        $course_obj = $DB->get_record('course', array('id' => $args['courseid']));

        $modinfo = get_fast_modinfo($course_obj);
        $sections = $modinfo->get_section_info_all(); 
        $parent_sections = array();

        $sect_index = 0;
        foreach($sections as $section) {
            $parent_section = $section->parent_section; // section color will be available through this object
            
            if($parent_section == '') {
                continue;
            }

            $new_section = new \stdClass();
            $new_section->parent_section = $parent_section;
            $new_section->section_id = $section->id;

            // get completion
            if (empty($modinfo->sections[$section->section])) {
                $new_section->completion = '';
            }
    
            // Generate array with count of activities in this section.
            $sectionmods = array();
            $total = 0;
            $complete = 0;
            $cancomplete = isloggedin() && !isguestuser();
            $completioninfo = new \completion_info($course);
            foreach ($modinfo->sections[$section->section] as $cmid) {
                $thismod = $modinfo->cms[$cmid];
    
                if ($thismod->uservisible) {
                    if (isset($sectionmods[$thismod->modname])) {
                        $sectionmods[$thismod->modname]['name'] = $thismod->modplural;
                        $sectionmods[$thismod->modname]['count']++;
                    } else {
                        $sectionmods[$thismod->modname]['name'] = $thismod->modfullname;
                        $sectionmods[$thismod->modname]['count'] = 1;
                    }
                    if ($cancomplete && $completioninfo->is_enabled($thismod) != COMPLETION_TRACKING_NONE) {
                        $total++;
                        $completiondata = $completioninfo->get_data($thismod, true);
                        if ($completiondata->completionstate == COMPLETION_COMPLETE ||
                                $completiondata->completionstate == COMPLETION_COMPLETE_PASS) {
                            $complete++;
                        }
                    }
                }
            }
    
    
            $percentage_completed = $complete.'/'.$total;
            $new_section->completion_value = $percentage_completed; 
    
            if($complete/$total == 1 || $total == 0){
                $new_section->completed = 'true';
            } else {
                $new_section->completed = 'false'; 
            }

            $name = get_section_name($course, $section);
        
            $new_section->name = $name;
        
            $makenew = true;

            foreach ($parent_sections as &$psect) {
                if($psect['parent_section'] == $parent_section) {
                    $old_val = $psect['sub_sections'];
        
                    $psect['sub_sections'] = array_merge($old_val, [$new_section]);
                    $makenew = false;
        
                } 
            }
        
            if($makenew) {
                $psect_new = array();
                $psect_new['parent_section'] = $parent_section;
                if($sect_index > 0) {
                    $psect_new['parent_section_readable'] = $sect_index.'. ' . ucwords(str_replace('_', ' ', $parent_section));
                } else {
                    $psect_new['parent_section_readable'] = ucwords(str_replace('_', ' ', $parent_section));
                }
                $psect_new['sub_sections'] = [$new_section];

                $parent_text = $DB->get_record('course_format_options', array('courseid' => $course->id, 'format' => 'thinkmodulartopics', 'name' => 'parent_sections'), $fields='*', $strictness=IGNORE_MISSING);
                $parent_text = preg_replace( "/\r|\n/", "", $parent_text->value);
                $parent_arr = array_filter(explode(';', $parent_text));

                $options = array();

                foreach ($parent_arr as $parent) {
                    $p_arr = array_filter(explode(':', $parent));
                    $p_obj = new \stdClass();
                    $p_obj->name = strtolower(str_replace(' ', '_', $p_arr[0]));
                    $p_obj->readable_name = $p_arr[0];
                    $p_obj->color = $p_arr[1];

                    array_push($options, $p_obj);
                }

                foreach ($options as $opt) {
                    $optname = preg_replace("/[^a-z0-9.]+/i", "", $opt->name);
                    $parent_sect_name = preg_replace("/[^a-z0-9.]+/i", "", $parent_section);
                    if($optname == $parent_sect_name) {
                        $psect_new['section_color'] = $opt->color;
                    }
                }

                array_push($parent_sections, $psect_new);
                $sect_index++;
            }
        }

        sort($parent_sections, SORT_STRING);

        $templatecontext = (object) [
            'sections' => $parent_sections,
        ];

        $mustacheTemplate = $OUTPUT->render_from_template('format_thinkmodulartopics/mobile_course', $templatecontext);

        return [
            'templates' => [
                [
                    'id' => 'main',
                    'html' => $mustacheTemplate,
                ]
            ],
            'javascript' => file_get_contents($CFG->dirroot. '/course/format/thinkmodulartopics/appjs/mobile.js'),
            'otherdata' => [
                'parent_sections' => json_encode($parent_sections),
            ], //this is where we add in the json enoded info from the settings
        ];
    }

    public static function thinkmodular_init(array $args) : array {
        global $CFG;
        return [
            'javascript' => file_get_contents($CFG->dirroot .'/course/format/thinkmodulartopics/appjs/mobile.js')
        ];
    }

    public static function mobile_course_module($args) {

        $template = file_get_contents($CFG->dirroot .'/course/format/thinkmodulartopics/templates/mobile_module.html');

        return [
            'templates' => [
                [
                    'id' => 'main',
                    'html' => $template,
                ]
            ],
            'javascript' => file_get_contents($CFG->dirroot. '/course/format/thinkmodulartopics/appjs/mobile.js'),
            'otherdata' => [
            ], //this is where we add in the json enoded info from the settings
        ];

    }

} ?>