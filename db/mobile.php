<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Format tiles plugin event handler definition.
 *
 * @package   format_mobileformat
 * @category  event
 * @copyright 2020 Will Nahmens {@link http://willnahmens.com}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$addons = [
    'format_thinkmodulartopics' => [
        'handlers' => [ // Different places where the plugin will display content.
            'thinkmodulartopics_format' => [ // Handler unique name (alphanumeric).
                'delegate' => 'CoreCourseFormatDelegate', // Delegate (where to display the link to the plugin)
                'method' => 'mobile_course_view', // Main function in \format_mobileformat\output\mobile.
                'styles' => [
                    'url' => $CFG->wwwroot . '/course/format/thinkmodulartopics/mobile.css', //automatically gets new version
                    'version' => 2019041066
                ],
                'displaysectionselector' => false, // Set to false to disable the default section selector.
                'displayenabledownload' => false, // Set to false to hide the "Enable download" option in the course context menu.
            ],
        ],
        'lang' => [
            ['pluginname', 'thinkmodulartopics'] 
        ],
        'init' => 'thinkmodular_init'
    ]
];