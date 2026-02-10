const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );

        // Insert into Supabase
        const { data: result, error } = await supabase
            .from('consultant_expertise')
            .insert([{
                consultant_name: data.consultantName,
                erp_experience: data.erpExperience,
                languages_spoken: data.languagesSpoken,
                years_in_distribution: data.yearsInDistribution,
                skills_data: data,
                submitted_at: new Date().toISOString()
            }]);

        if (error) throw error;

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Expertise submitted successfully' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to submit expertise' })
        };
    }
};
